import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!active) return;
      if (error) setError(error.message);
      else setCategories(data ?? []);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return { categories, loading, error };
}
