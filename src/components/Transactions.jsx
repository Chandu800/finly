// Transactions.jsx
// Displays user's transactions and allows adding new ones.

import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import DropdownMenu from "./DropdownMenu";
import { useResourceActions } from "../hooks/useResourceActions";
import EditModal from "./EditModal";
import { CATEGORY_OPTIONS } from "../utils/constants"

export default function Transactions({ user, accounts }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    account_id: "",
    amount: "",
    type: "expense",
    category: "",
    date: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [editTransaction, setEditTransaction] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch all transactions for current user from supabase.
  const fetchTransactions = async () => {
    setLoading(true);
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    if (error) setError(error.message);
    else setTransactions(transactions);
    setLoading(false);
  };

  // On component mount or when user changes, fetch transactions.
  useEffect(() => {
    if (user?.id) fetchTransactions();
    // eslint-disable-next-line
  }, [user]);

  // Updates form state as user types/selects in the add transaction form.
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission to add a new transaction.
  // Inset into supabase, then refetch transaction and reset form.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { error } = await supabase.from("transactions").insert([
      {
        user_id: user.id,
        account_id: form.account_id,
        amount: parseFloat(form.amount),
        type: form.type,
        category: form.category,
        date: form.date,
        description: form.description,
      },
    ]);
    if (error) {
      setError(error.message);
      return;
    }
    await fetchTransactions();
    setForm({
      account_id: "",
      amount: "",
      type: "expense",
      category: "",
      date: "",
      description: "",
    });
  };

  // Edit & delete functionalities
  const { handleDelete, handleUpdate, error: actionError } = useResourceActions({
    table: "transactions",
    onSuccess: fetchTransactions,
  })
  // Shows loading message while fetching data
  // if (loading) return <div>Loading transactions...</div>;

  return (
    <div className="min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Transactions</h1>
          <p className="text-gray-500">View and manage all of your financial activities</p>
        </div>
        <button className="bg-blue-500 px-4 py-2 rounded-md text-white font-semibold shadow hover:bg-blue-600 transition w-full sm:w-auto" onClick={() => setShowAddModal(true)}>
          + Add transaction
        </button>
      </div>

      {/* Form for adding new transactions */}
      <EditModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        item={null}
        title="Add New Transaction"
        description="Enter the details of your transaction below."
        saveLabel="Add Transaction"
        fields={[
          {
            name: "type",
            type: "select",
            options: [
              { value: "expense", label: "Expense" },
              { value: "income", label: "Income" },
            ],
            placeholder: "Transaction Type",
            required: true,
          },
          {
            name: "account_id",
            type: "select",
            options: accounts.map((acc) => ({
              value: acc.id,
              label: acc.name,
            })),
            placeholder: "Select Account",
            required: true,
          },
          { name: "description", label: "Name", placeholder: "e.g. Grocery shopping" },
          { name: "amount", label: "Amount", placeholder: "0.00", type: "number", required: true },
          {
            name: "category",
            label: "Category",
            placeholder: "Select a Category",
            type: "select",
            required: true,
            options: CATEGORY_OPTIONS,
          },
          { name: "date", label: "Date", type: "date", required: true },
        ]}
        onSave={async (newTxn) => {
          const { error } = await supabase.from("transactions").insert([
            {
              ...newTxn,
              user_id: user.id,
              amount: parseFloat(newTxn.amount),
            },
          ]);
          if (!error) {
            setShowAddModal(false);
            fetchTransactions();
          } else {
            setError(error.message);
          }
        }}
      />

      {/* Displays error message if any */}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      
      {/* Displays transactions in a table, showing account name and details. */}
      {transactions.length === 0 ? (
        <div>No transactions found.</div>
      ) : (
          <div className="overflow-x-auto">   
            <h3 className="m-4 text-xl font-semibold text-neutral-700">Transaction history</h3>
            <table className="bg-white rounded-xl shadow w-full sm:min-w-[800px]">
              <thead>
                <tr className="text-gray-500 text-sm border-b">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Account</th>
                  <th className="px-4 py-2 text-left whitespace-nowrap">Date</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  {/* No Actions column */}
                  <th className="px-4 py-2 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className="group border-t hover:bg-gray-50 transition relative"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">{txn.description}</td>
                    <td className="px-4 py-2">
                      {(() => {
                        const cat = CATEGORY_OPTIONS.find(c => c.value === txn.category);
                        const badgeColor = cat?.color || "bg-gray-100 text-gray-800";
                        return (
                          <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${badgeColor}`}>
                            {cat?.label || txn.category}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {accounts.find((acc) => acc.id === txn.account_id)?.name || ""}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{txn.date}</td>
                    <td className="px-4 py-2 capitalize">{txn.type}</td>
                    <td
                      className={`px-4 py-2 whitespace-nowrap ${
                        txn.type === "expense" ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {txn.type === "expense" ? "-" : "+"}
                      ₹{Number(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 relative">
                      {/* DropdownMenu only visible on row hover */}
                      <div className="hidden group-hover:block absolute right-2 top-1/2 -translate-y-1/2 z-10">
                        <DropdownMenu
                          onEdit={() => setEditTransaction(txn)}
                          onDelete={() => handleDelete(txn.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

      )}
      <EditModal
        isOpen={!!editTransaction}
        onClose={() => setEditTransaction(null)}
        item={editTransaction}
        title="Edit Transaction"
        saveLabel="Save Changes"
        fields={[
          {
            name: "type",
            type: "select",
            options: [
              { value: "expense", label: "Expense" },
              { value: "income", label: "Income" },
            ],
            placeholder: "Transaction Type",
            required: true,
          },
          {
            name: "account_id",
            type: "select",
            options: accounts.map((acc) => ({
              value: acc.id,
              label: acc.name,
            })),
            placeholder: "Select Account",
            required: true,
          },
          { name: "description", label: "Name", placeholder: "e.g. Grocery shopping" },
          { name: "amount", label: "Amount", placeholder: "0.00", type: "number", required: true },
          {
            name: "category",
            label: "Category",
            placeholder: "Select a Category",
            type: "select",
            required: true,
            options: CATEGORY_OPTIONS,
          },
          { name: "date", label: "Date", type: "date", required: true },
        ]}
        onSave={async (updated) => {
          await handleUpdate(editTransaction.id, {
            ...updated,
            amount: parseFloat(updated.amount),
          });
          setEditTransaction(null);
        }}
        loading={loading}
      />
      {actionError && <div className="text-red-500">{actionError}</div>}
    </div>
  );
}

