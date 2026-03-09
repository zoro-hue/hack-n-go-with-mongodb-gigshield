import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * Hook to fetch and cache the database schema from /api/schema.
 * Returns { schema, loading, error, refresh }
 */
export const useSchema = () => {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchema = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/api/schema`);
      setSchema(data.schema);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load schema.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchema();
  }, []);

  return { schema, loading, error, refresh: fetchSchema };
};
