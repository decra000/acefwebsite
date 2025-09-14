// hooks/useCountries.js
import { useEffect, useState } from "react";
import { API_URL } from "../config";

export const useCountries = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/countries`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Invalid response format");
        setCountries(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
};
