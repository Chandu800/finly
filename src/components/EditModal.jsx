import { useState, useEffect } from "react";

export default function EditModal({
  isOpen,
  onClose,
  item,
  fields,
  onSave,
  loading,
  title,
  description,
  saveLabel,
}) {
  const [form, setForm] = useState(item || {});

  useEffect(() => {
    setForm(item || {});
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 min-w-[400px] max-w-[90vw]">
        <h2 className="text-lg font-bold">{title || (item ? "Edit" : "Add New")}</h2>
        <p className="text-sm text-neutral-900 mb-4">{description}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-1">
              <label htmlFor={field.name} className="font-medium rounded-md">
                {field.name || field.placeholder}
              </label>
              {field.type === "select" ? (
              <select
                name={field.name}
                value={form[field.name] || ""}
                onChange={handleChange}
                required={field.required}
                className="border border-gray-300 px-4 py-2 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer appearance-none shadow-sm"
                disabled={loading}
              >
                <option value="">{field.placeholder}</option>
                {field.options &&
                  field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
              </select>

              ) : (
                <input
                  name={field.name}
                  value={form[field.name] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  type={field.type || "text"}
                  required={field.required}
                  className="border px-2 py-1 rounded"
                  disabled={loading}
                />
              )}
            </div>
          ))}
          <div className="flex gap-2 mt-4 justify-between">
            <button
              type="button"
              className="bg-gray-400 text-white px-4 py-1 rounded-md"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-1 rounded-md"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : saveLabel || (item ? "Save" : "Add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
