import { useState } from "react";
import { supabase } from "../supabaseClient";

export function useResourceActions({ table, onSuccess }) {
  const [error, setError] = useState("");

  // Delete function
  const handleDelete = async (id) => {
    setError("");
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) setError(error.message);
    else if (onSuccess) onSuccess();
  };

  // Edit function
  const handleUpdate = async (id, updateFields) => {
    setError("");
    const { error } = await supabase
      .from(table)
      .update(updateFields)
      .eq("id", id);
    if (error) {
      setError (error.message)
    } else if (onSuccess) {
      onSuccess();
    } 
  };

  return { handleDelete, handleUpdate, error };
}
