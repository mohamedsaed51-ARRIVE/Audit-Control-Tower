import { createContext, useContext, useEffect, useState } from "react";
import { getDashboardData } from "../services/dashboardService";

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const data = await getDashboardData();

      setDashboard(data);
      setLastSync(new Date());
      setError(null);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        dashboard,
        loading,
        error,
        lastSync,
        refreshDashboard: loadDashboard,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}