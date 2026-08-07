import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const DEFAULTS = {
  site_name: "বাজার",
  contact_phone: "",
  contact_email: "",
  footer_address: "সিরাজগঞ্জ, রাজশাহী বিভাগ, বাংলাদেশ",
};

export function useSiteSettings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("site_settings")
      .select("*")
      .then(({ data }) => {
        if (!active) return;
        const map = { ...DEFAULTS };
        (data ?? []).forEach((row) => {
          if (row.value) map[row.key] = row.value;
        });
        setSettings(map);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { settings, loading };
}
