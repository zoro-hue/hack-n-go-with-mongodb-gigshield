import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * Hook to send a natural language question to the backend
 * and receive a translated + executed MongoDB query result.
 */
export const useQuery = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (question) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(`${API_URL}/api/query`, { question });
      return data;
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        "An unexpected error occurred.";
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
};
