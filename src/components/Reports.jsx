import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { FaFilePdf } from "react-icons/fa";
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { CATEGORY_OPTIONS } from "../utils/constants";
import html2pdf from "html2pdf.js";

const COLORS = ["#155DFC", "#E60076", "#7F22FE", "#EC003F", "#D08700", "#F54A00", "#45556C", "#E7000B", "#00A63E"];

function useTransactions(userId, fromDate, toDate) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    const actualFrom = new Date(fromDate) <= new Date(toDate) ? fromDate : toDate;
    const actualTo = new Date(toDate) >= new Date(fromDate) ? toDate : fromDate;

    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .gte("date", actualFrom)
      .lte("date", actualTo)
      .order("date", { ascending: true })
      .then(({ data, error }) => {
        setTransactions(data || []);
        setLoading(false);
      });
  }, [userId, fromDate, toDate]);

  return { transactions, loading };
}

export default function Reports({ user }) {
  const [outerRadius, setOuterRadius] = useState(100);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  const { transactions, loading } = useTransactions(user?.id, fromDate, toDate);

  // Process data for charts
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Line chart data (group by date)
  const lineDataMap = {};
  transactions.forEach(t => {
    if (!lineDataMap[t.date]) {
      lineDataMap[t.date] = { date: t.date, income: 0, expense: 0 };
    }
    if (t.type === "income") {
      lineDataMap[t.date].income += Number(t.amount || 0);
    } else if (t.type === "expense") {
      lineDataMap[t.date].expense += Number(t.amount || 0);
    }
  });

  const lineChartData = Object.values(lineDataMap).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Pie chart data (expense categories)
  const categoryData = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + (Number(t.amount || 0));
      return acc;
    }, {});

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value
  }));

  // PDF download ref
  const reportRef = useRef();

  // PDF download handler
  const handleDownloadPDF = () => {
    if (!reportRef.current) return;
    html2pdf()
      .set({
        margin: 0.3,
        filename: `Financial_Report_${fromDate}_to_${toDate}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 3 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
      })
      .from(reportRef.current)
      .save();
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Financial Report</h1>

      {/* Date Picker & Controls */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-8 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex gap-2 items-center flex-1 flex-wrap">
          <span className="mx-2">From</span>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <span className="mx-2">to</span>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        </div>
        <button
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition w-full sm:w-auto"
          disabled={loading}
          onClick={handleDownloadPDF}
        >
          <FaFilePdf /> Download Report
        </button>
      </div>

      <div ref={reportRef}>
        <div className="text-center mb-4 flex flex-col sm:flex-row items-center gap-2">
          <h2 className="text-lg font-semibold">
            Your financial history
          </h2>
          <div className="text-gray-500 ">
           from {fromDate} to {toDate}
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-600">Generating report...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-500 mb-4">No transactions found for selected period</p>
            <p className="text-sm text-gray-400">
              Start tracking your finances to see detailed reports!
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600">Total Income</div>
                <div className="text-xl md:text-2xl font-bold">₹{totalIncome.toFixed(2)}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600">Total Expense</div>
                <div className="text-xl md:text-2xl font-bold">₹{totalExpense.toFixed(2)}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600">Net Savings</div>
                <div className="text-xl md:text-2xl font-bold">₹{(totalIncome - totalExpense).toFixed(2)}</div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="border-2 border-dashed rounded-xl p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold mb-4">Spending Trend</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="expense"
                        stroke="#EF4444"
                        strokeWidth={2}
                        name="Expenses"
                      />
                      <Line
                        type="monotone"
                        dataKey="income"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="Income"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto m-4">
                  <table className="w-full min-w-[400px] text-sm">
                    <thead>
                      <tr>
                        <th className="py-1 px-2 text-left whitespace-nowrap">Date</th>
                        <th className="py-1 px-2 text-left whitespace-nowrap">Income</th>
                        <th className="py-1 px-2 text-left whitespace-nowrap">Expense</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineChartData.map((item) => (
                        <tr key={item.date}>
                          <td className="py-1 px-2 whitespace-nowrap">{item.date}</td>
                          <td className="py-1 px-2 whitespace-nowrap">₹{(item.income || 0).toFixed(2)}</td>
                          <td className="py-1 px-2 whitespace-nowrap">₹{(item.expense || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-2 border-dashed rounded-xl p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold mb-4">Spending by Category</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%" onResize={(width) => {setOuterRadius(width < 400 ? 70 : 100);
                  }}>
                    <PieChart> 
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={outerRadius}
                        className="outline-none"
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto mt-4">
                  <table className="w-full min-w-[300px] text-sm">
                    <thead>
                      <tr>
                        <th className="py-1 px-2 text-left whitespace-nowrap">Category</th>
                        <th className="py-1 px-2 text-left whitespace-nowrap">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pieData.map((item) => (
                        <tr key={item.name}>
                          <td className="py-1 px-2 whitespace-nowrap">{item.name}</td>
                          <td className="py-1 px-2 whitespace-nowrap">₹{item.value.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="border-2 border-dashed rounded-xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-4">Transactions history</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 px-2 whitespace-nowrap">Date</th>
                      <th className="py-2 px-2 whitespace-nowrap">Category</th>
                      <th className="py-2 px-2 whitespace-nowrap">Description</th>
                      <th className="py-2 px-2 whitespace-nowrap">Type</th>
                      <th className="py-2 px-2 whitespace-nowrap">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="border-b ">
                        <td className="whitespace-nowrap">{txn.date}</td>
                        <td className="whitespace-nowrap">
                          {(() => {
                            const cat = CATEGORY_OPTIONS.find(c => c.value === txn.category);
                            
                            return (
                              <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold `}>
                                {cat?.label || txn.category}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="whitespace-nowrap">{txn.description}</td>
                        <td className="p-2 whitespace-nowrap">{txn.type}</td>
                        <td className={`p-2 font-semibold whitespace-nowrap ${txn.type === "income" ? "text-green-600" : "text-red-600"}`}>
                          {txn.type === "income" ? "+" : "-"}₹{Math.abs(Number(txn.amount) || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
