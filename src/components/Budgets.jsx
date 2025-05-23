import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import EditModal from "../components/EditModal";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const CATEGORY_OPTIONS = [
  { value: "Entertainment", label: "Entertainment" },
  { value: "Food", label: "Food" },
  { value: "Shopping", label: "Shopping" },
  { value: "Transportation", label: "Transportation" },
  { value: "Utilities", label: "Utilities" },
  { value: "Subscriptions", label: "Subscriptions" },
  { value: "Bills", label: "Bills" },
  { value: "Housing", label: "Housing" },
  { value: "Health", label: "Health" },
  { value: "Others", label: "Others" },
];

const periodFieldOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
];

function getMonthYear() {
  return new Date().toLocaleString("default", { month: "long", year: "numeric" });
}

function getSpentForCategory(transactions, category, period = "monthly") {
  const now = new Date();
  return transactions
    .filter((txn) => {
      if (txn.type !== "expense") return false;
      if (txn.category !== category) return false;
      const txnDate = new Date(txn.date);
      if (period === "monthly") {
        return txnDate.getMonth() === now.getMonth() && txnDate.getFullYear() === now.getFullYear();
      } else if (period === "weekly") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return txnDate >= startOfWeek && txnDate <= endOfWeek;
      }
      return false;
    })
    .reduce((sum, txn) => sum + Number(txn.amount), 0);
}

export default function Budgets({ user }) {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  // Fetch budgets and transactions
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      supabase.from("budgets").select("*").eq("user_id", user.id),
      supabase.from("transactions").select("*").eq("user_id", user.id),
    ]).then(([budgetsRes, transactionsRes]) => {
      setBudgets(budgetsRes.data || []);
      setTransactions(transactionsRes.data || []);
      setLoading(false);
    });
  }, [user]);

  // Modal fields definition
  const fields = [
    {
      name: "category",
      type: "select",
      required: true,
      placeholder: "Select category",
      options: CATEGORY_OPTIONS,
    },
    {
      name: "amount",
      type: "number",
      required: true,
      placeholder: "Budget Amount (₹)",
    },
    {
      name: "period",
      type: "select",
      required: true,
      placeholder: "Select period",
      options: periodFieldOptions,
    },
  ];

  // Open modal for create or edit
  const openModal = (budget = null) => {
    setEditingBudget(budget);
    setModalOpen(true);
  };
  const closeModal = () => {
    setEditingBudget(null);
    setModalOpen(false);
  };

  // Save handler for modal
  const handleSave = async (form) => {
    setModalLoading(true);
    const amountNum = Number(form.amount);
    if (!form.category || !form.period || !amountNum || amountNum <= 0) {
      setModalLoading(false);
      return;
    }
    // Prevent duplicate for same category & period (except when editing)
    const duplicate = budgets.find(
      (b) =>
        b.category === form.category &&
        b.period === form.period &&
        (!editingBudget || b.id !== editingBudget.id)
    );
    if (duplicate) {
      alert("Budget for this category and period already exists.");
      setModalLoading(false);
      return;
    }
    if (editingBudget) {
      // Update
      const { error } = await supabase
        .from("budgets")
        .update({ category: form.category, amount: amountNum, period: form.period })
        .eq("id", editingBudget.id)
        .eq("user_id", user.id);
      if (!error) {
        setBudgets((b) =>
          b.map((item) => (item.id === editingBudget.id ? { ...item, ...form, amount: amountNum } : item))
        );
      }
    } else {
      // Insert
      const { data, error } = await supabase
        .from("budgets")
        .insert([{ user_id: user.id, category: form.category, amount: amountNum, period: form.period }])
        .single();
      if (!error && data) {
        setBudgets((b) => [...b, data]);
      }
    }
    setModalLoading(false);
    closeModal();
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;
    const { error } = await supabase.from("budgets").delete().eq("id", id).eq("user_id", user.id);
    if (!error) {
      setBudgets((b) => b.filter((budget) => budget.id !== id));
    }
  };

  // Budget overview calculations
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgets.reduce(
    (sum, b) => sum + getSpentForCategory(transactions, b.category, b.period),
    0
  );
  const percentUsed = totalBudget ? (totalSpent / totalBudget) * 100 : 0;
  const totalRemaining = totalBudget - totalSpent;

  // if (loading) {
  //   return <div className="p-8">Loading budgets...</div>;
  // }

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Budgets</h2>
          <div className="text-gray-500">Manage your spending limits and track your progress</div>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition w-full md:w-auto"
        >
          + Create Budget
        </button>
      </div>

      {/* Budget Overview */}
      <div className="rounded-xl border-2 border-dashed p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="w-full">
            <div className="text-gray-600 text-md mb-3">Summary of all your budgets for {getMonthYear()}</div>
            <div className="flex flex-col sm:flex-row mb-2 gap-4 sm:gap-0 justify-between">
              <div className="sm:flex sm:flex-col text-center">
                <div className="text-sm text-gray-500 mb-1 text-center">Total Budget</div>
                <div className="text-2xl md:text-3xl font-bold sm:text-center">₹{totalBudget.toFixed(2)}</div>
              </div>
              <div className="sm:flex sm:flex-col text-center" >
                <div className="text-sm text-gray-500 mb-1 text-center">Total Spent</div>
                <div className="text-2xl md:text-3xl font-bold text-red-500">₹{totalSpent.toFixed(2)}</div>
              </div>
              <div className="sm:flex sm:flex-col text-center" >
                <div className="text-sm text-gray-500 mb-1 text-center">Remaining</div>
                <div className="text-2xl md:text-3xl font-bold text-green-600">₹{totalRemaining.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">{percentUsed.toFixed(0)}% of total budget used</div>
      </div>

      {/* Budgets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.length === 0 && <p>No budgets added yet.</p>}
        {budgets.map((budget) => {
          const spent = getSpentForCategory(transactions, budget.category, budget.period);
          const percent = budget.amount ? (spent / budget.amount) * 100 : 0;
          const remaining = budget.amount - spent;
          const over = spent > budget.amount;

          return (
            <div
              key={budget.id}
              className="bg-white rounded-xl shadow p-5 group relative transition hover:shadow-lg flex flex-col"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg">{budget.category}</div>
                  <div className="text-gray-400 text-xs">
                    {budget.period === "weekly" ? "This week" : getMonthYear()}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => openModal(budget)}
                    className=" hover:text-blue-600 hover:bg-gray-200 p-1 rounded-md"
                    title="Edit Budget"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className=" hover:text-red-600 hover:bg-gray-200 p-1 rounded-md"
                    title="Delete Budget"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-sm mt-3 mb-1">
                <span>
                  Spent: <b>₹{spent.toFixed(2)}</b>
                </span>
                <span>
                  Budget: <b>₹{Number(budget.amount).toFixed(2)}</b>
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    over
                      ? "bg-red-500"
                      : percent > 75
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className={over ? "text-red-600" : "text-gray-500"}>
                  {percent.toFixed(0)}% used
                </span>
                <span className={over ? "text-red-600" : "text-gray-500"}>
                  {over
                    ? `Over by ₹${Math.abs(remaining).toFixed(2)}`
                    : `Remaining: ₹${remaining.toFixed(2)}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Add/Edit Budget */}
      <EditModal
        isOpen={modalOpen}
        onClose={closeModal}
        item={editingBudget}
        fields={fields}
        onSave={handleSave}
        loading={modalLoading}
        title={editingBudget ? "Edit Budget" : "Add New Budget"}
        saveLabel={editingBudget ? "Update Budget" : "Add Budget"}
      />
    </div>
  );
}
