import { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { supabase } from "../supabaseClient";
import EditModal from "./EditModal";
import { FaCalendarAlt, FaPlusCircle } from "react-icons/fa";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

// Goal icon mapping (customize as needed)
const GOAL_ICONS = {
  Vacation: "🏖️",
  Emergency: "⭐",
  Laptop: "💻",
  Car: "🚗",
  House: "🏠",
  Education: "🎓",
  Wedding: "💍",
  Other: "🎯",
};

function GoalWideCard({ goal, onEdit, onDelete }) {
  const saved = Number(goal.saved_amount) || 0;
  const target = Number(goal.target_amount) || 1;
  const progress = Math.min((saved / target) * 100, 100);
  const remaining = target - saved;
  const over = saved >= target;

  return (
    <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-lg transition flex flex-col md:flex-row items-center md:items-stretch px-4 sm:px-6 py-6">
      {/* Edit/Delete on hover */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
        <button
          className="text-gray-400 hover:text-indigo-500"
          onClick={onEdit}
          title="Edit"
        >
          <FiEdit2 />
        </button>
        <button
          className="text-gray-400 hover:text-red-500"
          onClick={onDelete}
          title="Delete"
        >
          <FiTrash2 />
        </button>
      </div>

      {/* Left: Info */}
      <div className="flex-1 flex flex-col justify-between w-full">
        {/* Row 1: Goal name, category */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8 flex-wrap">
          <span className="text-2xl sm:text-3xl">{GOAL_ICONS[goal.category] || "🎯"}</span>
          <span className="text-lg sm:text-xl font-bold text-gray-800">{goal.name}</span>
          {goal.category && (
            <span className="ml-2 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium">
              {goal.category}
            </span>
          )}
        </div>
        {/* Row 2: Amounts, date, status */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex">
            <div>
              <div className="text-gray-500 text-xs text-center">Saved</div>
              <div className="text-base sm:text-lg font-semibold text-green-600">
                ₹{saved.toLocaleString()}
              </div>
            </div>
            <div className="h-10 bg-gray-300 w-[1px] ml-4"></div>
          </div>
          <div className="flex">
            <div>
              <div className="text-gray-500 text-xs text-center">Target</div>
              <div className="text-base sm:text-lg font-semibold text-indigo-700">
                ₹{target.toLocaleString()}
              </div>
            </div>
            <div className="h-10 bg-gray-300 w-[1px] ml-4"></div>
          </div>
          <div>
            <div className="text-gray-500 text-sm lg:text-md md:text-md text-center">Remaining</div>
            <div className={`text-sm lg:text-lg md:text-lg font-semibold ${over ? "text-green-600" : "text-orange-600"}`}>
              {over ? "Goal reached!" : `₹${remaining.toLocaleString()}`}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <p className="text-gray-400 text-sm">Deadline :</p>
            <FaCalendarAlt className="text-gray-400" size={12} />
            <span className="text-gray-500 text-xs">
              {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : "-"}
            </span>
          </div>
        </div>
      </div>
      {/* Right: Progress Circle */}
      <div className="mt-3 lg:mt-8 md:ml-8">
        <div className="w-20 h-20 sm:w-24 sm:h-24">
          <CircularProgressbar
            value={progress}
            text={`${Math.round(progress)}%`}
            styles={buildStyles({
              pathColor: over ? "#22c55e" : progress > 80 ? "#fbbf24" : "#6366f1",
              textColor: "#000",
              trailColor: "#e5e7eb",
            })}
          />
        </div>
      </div>
    </div>
  );
}


export default function Goals({ user }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [error, setError] = useState("");

  // Fetch goals for the user
  const fetchGoals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setGoals(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) fetchGoals();
    // eslint-disable-next-line
  }, [user]);

  // CRUD operations
  const handleAdd = async (goal) => {
    const { error } = await supabase.from("goals").insert([
      { ...goal, user_id: user.id },
    ]);
    if (!error) {
      setShowAddModal(false);
      fetchGoals();
    } else {
      setError(error.message);
    }
  };

  const handleEdit = async (updated) => {
    const { error } = await supabase
      .from("goals")
      .update(updated)
      .eq("id", editGoal.id);
    if (!error) {
      setEditGoal(null);
      fetchGoals();
    } else {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (!error) fetchGoals();
    else setError(error.message);
  };

  return (
    <div className="min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-indigo-600">Dream Goals</h2>
          <p className="text-gray-500">Track and achieve your financial aspirations</p>
        </div>
        <button
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition flex items-center gap-2 w-full md:w-auto justify-center"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlusCircle /> Create Goal
        </button>
      </div>

      {loading ? (
        <div>Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          <div className="text-6xl mb-4">🎯</div>
          <div className="font-semibold text-lg">No goals yet</div>
          <div className="text-gray-500">Start by creating your first goal!</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <GoalWideCard
              key={goal.id}
              goal={goal}
              onEdit={() => setEditGoal(goal)}
              onDelete={() => handleDelete(goal.id)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Goal Modals */}
      <EditModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        item={null}
        title="Create New Goal"
        description="Set a new savings goal to track your progress."
        saveLabel="Create Goal"
        fields={[
          {
            name: "name",
            label: "Goal Name",
            type: "text",
            placeholder: "e.g. Vacation Fund",
            required: true,
          },
          {
            name: "target_amount",
            label: "Target Amount",
            type: "number",
            placeholder: "Enter amount",
            required: true,
          },
          {
            name: "saved_amount",
            label: "Initial Savings",
            type: "number",
            placeholder: "How much saved so far?",
            required: false,
          },
          {
            name: "category",
            label: "Category",
            type: "select",
            options: Object.keys(GOAL_ICONS).map(key => ({
              value: key,
              label: key,
            })),
            placeholder: "Select Category",
            required: false,
          },
          {
            name: "target_date",
            label: "Target Date",
            type: "date",
            required: false,
          },
        ]}
        onSave={handleAdd}
        loading={loading}
      />

      <EditModal
        isOpen={!!editGoal}
        onClose={() => setEditGoal(null)}
        item={editGoal}
        title="Edit Goal"
        description="Update your goal details or add funds."
        saveLabel="Save Changes"
        fields={[
          {
            name: "name",
            label: "Goal Name",
            type: "text",
            placeholder: "e.g. Vacation Fund",
            required: true,
          },
          {
            name: "target_amount",
            label: "Target Amount",
            type: "number",
            placeholder: "Enter amount",
            required: true,
          },
          {
            name: "saved_amount",
            label: "Saved Amount",
            type: "number",
            placeholder: "How much saved so far?",
            required: false,
          },
          {
            name: "category",
            label: "Category",
            type: "select",
            options: Object.keys(GOAL_ICONS).map(key => ({
              value: key,
              label: key,
            })),
            placeholder: "Select Category",
            required: false,
          },
          {
            name: "target_date",
            label: "Target Date",
            type: "date",
            required: false,
          },
        ]}
        onSave={handleEdit}
        loading={loading}
      />

      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
}
