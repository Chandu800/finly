import { useState, useRef, useEffect } from "react";
import { MdOutlineMoreVert } from "react-icons/md";

export default function DropdownMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  // Close menu on outside click or ESC key
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-full hover:bg-gray-200 focus:bg-gray-200 focus:outline-none transition"
        aria-label="More options"
        tabIndex={0}
      >
        <MdOutlineMoreVert size={20} />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-xl z-20 animate-fade-in"
          style={{ minWidth: "8rem" }}
        >
          <button
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-xl transition"
            onClick={() => { setOpen(false); onEdit(); }}
          >
            Edit
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-b-xl transition"
            onClick={() => { setOpen(false); onDelete(); }}
          >
            Delete
          </button>
        </div>
      )}
      {/* Optional: Add a fade-in animation */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}
