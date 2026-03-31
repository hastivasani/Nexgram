import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useState, useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const auth = useAuth();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(t);
  }, []);

  if (!auth) return null;

  const { user, loading } = auth;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-theme-primary gap-3">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        {slow && (
          <p className="text-sm text-gray-400">Server is waking up, please wait...</p>
        )}
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
