import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { FaWallet, FaArrowDown, FaArrowUp } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaPlusCircle } from "react-icons/fa";
import EditModal from "./EditModal";
import { startOfMonth, endOfMonth, format, isAfter, subMonths} from "date-fns";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Home from "../assets/images/3d-house.png"
import Wallet from "../assets/images/wallet.png"
import Profits from "../assets/images/profits.png"

export default function DashboardHome({ user }) {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6M");
  const [outerRadius, setOuterRadius] = useState(100);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      supabase.from("accounts").select("*").eq("user_id", user.id),
      supabase.from("transactions").select("*").eq("user_id", user.id).order("date", { ascending: false })
    ]).then(([accountsRes, transactionsRes]) => {
      setAccounts(accountsRes.data || []);
      setTransactions(transactionsRes.data || []);
      setLoading(false);
    });
  }, [user]);

  // Helper for currency formatting
  const formatCurrency = (n) => "₹" + (n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });

  // Calculate dynamic total balance
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

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + getAccountBalance(acc),
    0
  );

  // Get the 5 most recent transactions
  const recentTxns = transactions.slice(0, 5);

  // if (loading) {
  //   return <div className="p-8">Loading dashboard...</div>;
  // }

  // Monthly income card function
  const getMonthlyTotal = (type) => {
  const now = new Date();
  return transactions
    .filter(txn => 
      txn.type === type && 
      new Date(txn.date) >= startOfMonth(now) &&
      new Date(txn.date) <= endOfMonth(now)
    )
    .reduce((sum, txn) => sum + txn.amount, 0);
  };

  const monthlyIncome = getMonthlyTotal("income");
  const monthlySpending = getMonthlyTotal("expense");


  const getCategorySpending = () => {
  const categoryMap = transactions
    .filter(txn => txn.type === "expense")
    .reduce((acc, txn) => {
      acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
      return acc;
    }, {});

  return Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value
  }));
  };

  const getTrendData = () => {
    // Determine how many months to show based on selected time range
    let months = 6;
    if (timeRange === "1M") months = 1;
    if (timeRange === "3M") months = 3;
    if (timeRange === "6M") months = 6;
    if (timeRange === "1Y") months = 12;
    const now = new Date();
    // Build an array of month labels (e.g., ['May', 'Apr', ...])
    const monthsArr = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = subMonths(now, i);
      monthsArr.push(format(d, "MMM yyyy")); // e.g., "May 2025"
  }
  
  // Initialize trend data
  const trendData = monthsArr.map((label) => ({
    month: label,
    income: 0,
    expense: 0,
  }));
  
  // Group transactions by month and type
  transactions.forEach((txn) => {
    const txnDate = new Date(txn.date);
    // Only include transactions in the selected range
    if (isAfter(txnDate, subMonths(startOfMonth(now), months - 1))) {
      const label = format(txnDate, "MMM yyyy");
      const monthObj = trendData.find((d) => d.month === label);
      if (monthObj) {
        if (txn.type === "income") monthObj.income += txn.amount;
        if (txn.type === "expense") monthObj.expense += txn.amount;
      }
    }
  });
  
  return trendData;
  };


  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">Dashboard Overview</h2>
        <p className="text-gray-500 mt-2">
          Welcome back, {user?.name || "User"}! Here's an overview of your finances.
        </p>
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
        {/* Total balance card */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <img src={Wallet} className="h-16 md:h-14" />
          <div>
            <div className="text-gray-500 text-sm">Total Balance</div>
            <div className="text-3xl lg:text-3xl md:text-2xl font-bold text-gray-800">{formatCurrency(totalBalance)}</div>
          </div>
        </div>
        {/* Income card */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <img src={Profits} className="h-16 md:h-14"/>
          <div>
            <div className="text-gray-500 text-sm">Monthly Income</div>
            <div className="text-3xl lg:text-3xl md:text-2xl font-bold text-gray-800">{formatCurrency(monthlyIncome)}</div>
          </div>
        </div>
        {/* Spending card */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <FaArrowUp className="text-3xl text-red-600" />
          {/* <img src={Profits} className="h-16 md:h-14"/> */}
          <div>
            <div className="text-gray-500 text-sm">Monthly Spending</div>
            <div className="text-3xl lg:text-3xl md:text-2xl font-bold text-gray-800">{formatCurrency(monthlySpending)}</div>
          </div>
        </div>
      </div>

      {/* pichart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold md:text-xl text-lg mb-1 text-gray-800">Spending by Category</h3>
          <p className="text-gray-500 mb-4 text-sm">Your speding breakdown this month</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" onResize={(width) => {
        // Example: smaller radius for small screens
              setOuterRadius(width < 400 ? 70 : 100);
            }}>
              <PieChart>
                <Pie
                  data={getCategorySpending()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={outerRadius}
                  className="outline-none"
                  label
                >
                  {getCategorySpending().map((entry, index) => (
                    <Cell 
                      key={index} 
                      fill={["#155DFC", "#E60076", "#7F22FE", "#EC003F", "#D08700", "#F54A00", "#45556C", "#E7000B", "#00A63E"][index % 9]}
                      />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* bar chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <h3 className="font-semibold md:text-xl text-lg mb-1 text-gray-800">Income VS Expenses</h3>
              <p className="text-gray-500 mb-4 text-sm">Your financial trend over {timeRange}</p>
            </div>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border rounded px-2 py-1 text-sm bg-white"
            >
              <option value="1M">1 Month</option>
              <option value="3M">3 Months</option>
              <option value="6M">6 Months</option>
              <option value="1Y">1 Year</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getTrendData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#10B981" />
                <Bar dataKey="expense" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>



      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <div className="font-semibold text-lg text-gray-700">Recent Transactions</div>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button 
              className="text-black text-sm border bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center gap-2"
              >
              <FaPlusCircle /> Add
            </button>
            <Link 
              to="/transactions"
              className="text-black text-sm border bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center gap-1"
              >View all </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[650px]">
            <thead>
              <tr className="text-gray-500 text-sm sm:text-xs">
                <th className="py-2">Date</th>
                <th className="py-2">Account</th>
                <th className="py-2">Category</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {recentTxns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-gray-400 py-4 text-center">
                    No transactions found
                  </td>
                </tr>
              ) : (
                recentTxns.map((txn) => (
                  <tr className="border-t" key={txn.id}>
                    <td className="py-4">{txn.date}</td>
                    <td className="py-2">
                      {accounts.find((acc) => acc.id === txn.account_id)?.name || ""}
                    </td>
                    <td className="py-2">{txn.category}</td>
                    <td className={`py-2 ${txn.type === "expense" ? "text-red-500" : "text-green-500"}`}>
                      {txn.type === "expense" ? "-" : "+"}{formatCurrency(txn.amount)}
                    </td>
                    <td className="py-2">
                      {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
