import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { FaPlusCircle } from "react-icons/fa";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import EditModal from "./EditModal";

// Example account type icons/colors
const ACCOUNT_TYPES = {
  Checking: { icon: "💳", gradient: "from-blue-500 to-blue-300" },
  Savings: { icon: "🏦", gradient: "from-green-500 to-green-300" },
  "Credit Card": { icon: "💳", gradient: "from-orange-500 to-yellow-300" },
  Investment: { icon: "📈", gradient: "from-purple-500 to-purple-300" },
  Cash: { icon: "💵", gradient: "from-pink-500 to-pink-300" },
  Other: { icon: "💼", gradient: "from-gray-500 to-gray-300" },
};

function getAccountStyle(type) {
  return ACCOUNT_TYPES[type] || ACCOUNT_TYPES.Other;
}


function formatLastUpdated(dateStr) {
  if (!dateStr) return "-";
  const updated = new Date(dateStr);
  const now = new Date();
  const diffMs = now - updated;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Last Updated: Today";
  if (diffDays === 1) return "Last Updated: Yesterday";
  if (diffDays < 7) return `Last Updated: ${diffDays} days ago`;
  if (diffDays < 14) return "Last Updated: 1 week ago";
  // Format as dd-mm-yyyy
  return `Last Updated: ${updated.getDate().toString().padStart(2, "0")}-${(updated.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${updated.getFullYear()}`;
}

// Utility to classify account as asset or liability
function isLiability(account) {
  // You can refine this logic as per your data model
  return ["Credit Card", "Loan", "Liability"].includes(account.type);
}

function AccountCard({ account, balance, onEdit, onDelete }) {
  const { icon, gradient } = getAccountStyle(account.type);
  return (
    <div className={`group relative bg-gradient-to-tr ${gradient} rounded-2xl shadow-lg p-6 flex flex-col justify-between min-h-[180px] mb-6 transition-all`}>
      {/* Edit/Delete on hover */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
        <button
          className="text-white/70 hover:text-white"
          onClick={onEdit}
          title="Edit"
        >
          <FiEdit2 />
        </button>
        <button
          className="text-white/70 hover:text-red-500"
          onClick={onDelete}
          title="Delete"
        >
          <FiTrash2 />
        </button>
      </div>
      {/* Top Row: Icon, Type */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{icon}</span>
        <span className="text-lg font-bold text-white drop-shadow">{account.type}</span>
      </div>
      {/* Account Name */}
      <div className="text-white font-semibold text-xl mb-2">{account.name}</div>
      {/* Balance */}
      <div className="text-3xl font-bold text-white drop-shadow mb-2">
        ₹{balance.toLocaleString()}
      </div>
      {/* Last updated */}
      <div className="text-white/80 text-xs">
        {formatLastUpdated(account.updated_at)}
      </div>

    </div>

  );
}

function NetWorthCard({ accounts, getAccountBalance }) {
  const totalAssets = accounts
    .filter((acc) => !isLiability(acc))
    .reduce((sum, acc) => sum + getAccountBalance(acc), 0);

  const totalLiabilities = accounts
    .filter((acc) => isLiability(acc))
    .reduce((sum, acc) => sum + getAccountBalance(acc), 0);

  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="w-full mb-8">
      <div className="rounded-2xl border-2 border-dashed flex flex-col md:flex-row items-center justify-between p-6 gap-6">
        <div className="flex-1 text-center">
          <div className="text-xs font-semibold text-gray-500 text-center">Net Worth</div>
          <div className="text-2xl md:text-3xl font-bold mt-1">
            ₹{netWorth.toLocaleString()}
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xs font-semibold text-gray-500 text-center">Total Assets</div>
          <div className="text-2xl md:text-3xl font-bold text-green-600">
            ₹{totalAssets.toLocaleString()}
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xs font-semibold text-gray-500 text-center">Total Liabilities</div>
          <div className="text-2xl md:text-3xl font-bold text-red-500">
            ₹{totalLiabilities.toLocaleString()}
          </div>
        </div>
      </div>
    </div>

  );
}

export default function Accounts({ user }) {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editAccount, setEditAccount] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch all accounts for the current user from Supabase.
  const fetchAccounts = async () => {
    const { data, error } = await supabase
      .from("accounts")
      .select("*", "updated_at")
      .eq("user_id", user.id);
    if (error) setError(error.message);
    else setAccounts(data);
  };

  // Fetch all transactions for the current user from supabase.
  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id);
    if (error) setError(error.message);
    else setTransactions(data);
  };

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      Promise.all([fetchAccounts(), fetchTransactions()]).then(() => setLoading(false));
    }
    // eslint-disable-next-line
  }, [user]);

  // Calculate the current balance for an account
  const getAccountBalance = (account) => {
    const txnSum = transactions
      .filter(txn => txn.account_id === account.id)
      .reduce((sum, txn) => {
        if (txn.type === "income") return sum + txn.amount;
        if (txn.type === "expense") return sum - txn.amount;
        return sum;
      }, 0);
    return (account.balance || 0) + txnSum;
  };

  // Edit and delete
  const handleDelete = async (id) => {
    const { error } = await supabase.from("accounts").delete().eq("id", id);
    if (!error) fetchAccounts();
    else setError(error.message);
  };

  const handleUpdate = async (id, updated) => {
    const { error } = await supabase
      .from("accounts")
      .update({ ...updated, balance: Number(updated.balance) || 0, })
      .eq("id", id);
    if (!error) fetchAccounts();
    else setError(error.message);
  };

  // Add account handler for modal
  const handleAdd = async (form) => {
    const { error } = await supabase.from("accounts").insert([
      {
        user_id: user.id,
        name: form.name,
        type: form.type,
        balance: Number(form.balance) || 0,
      }
    ]);
    if (!error) {
      setShowAddModal(false);
      fetchAccounts();
    } else {
      setError(error.message);
    }
  };

  // if (loading) return <div>Loading accounts...</div>;

  return (
    <div className="min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Accounts</h2>
          <p className="text-gray-500">Manage all your linked financial accounts</p>
        </div>
        <button
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlusCircle /> Add Account
        </button>
      </div>
      <NetWorthCard accounts={accounts} getAccountBalance={getAccountBalance} />

      {error && <div className="text-red-500 mb-2">{error}</div>}

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.length === 0 ? (
          <div className="text-gray-500">No accounts found.</div>
        ) : (
          accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              balance={getAccountBalance(account)}
              onEdit={() => setEditAccount(account)}
              onDelete={() => handleDelete(account.id)}
            />

          ))
        )}
      </div>

      {/* Add Account Modal */}
      <EditModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        item={null}
        title="Add Account"
        description="Create a new account to track your finances."
        saveLabel="Add Account"
        fields={[
          { name: "name", label: "Account Name", type: "text", required: true },
          {
            name: "type",
            label: "Type",
            type: "select",
            options: Object.keys(ACCOUNT_TYPES).map(type => ({ value: type, label: type })),
            required: true
          },
          {
            name: "balance",
            label: "Initial Balance",
            type: "number",
            placeholder: "Enter amount",
            required: true
          }
        ]}
        onSave={handleAdd}
        loading={loading}
      />

      {/* Edit Modal */}
      <EditModal
        isOpen={!!editAccount}
        onClose={() => setEditAccount(null)}
        item={editAccount}
        title="Edit Account"
        description="Update your account details."
        saveLabel="Save Changes"
        fields={[
          { name: "name", label: "Account Name", type: "text", required: true },
          {
            name: "type",
            label: "Type",
            type: "select",
            options: Object.keys(ACCOUNT_TYPES).map(type => ({ value: type, label: type })),
            required: true
          },
          {
            name: "balance",
            label: "Balance",
            type: "number",
            placeholder: "Enter amount",
            required: true
          }
        ]}
        onSave={async (updated) => {
          await handleUpdate(editAccount.id, updated);
          setEditAccount(null);
        }}
        loading={loading}
      />
    </div>
  );
}
