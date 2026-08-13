"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface AdminNavContextType {
  resetKey: number;
  triggerReset: () => void;
}

const AdminNavContext = createContext<AdminNavContextType>({
  resetKey: 0,
  triggerReset: () => {},
});

export function AdminNavigationProvider({ children }: { children: React.ReactNode }) {
  const [resetKey, setResetKey] = useState(0);
  
  const triggerReset = useCallback(() => {
    setResetKey((prev) => prev + 1);
  }, []);

  return (
    <AdminNavContext.Provider value={{ resetKey, triggerReset }}>
      {children}
    </AdminNavContext.Provider>
  );
}

export function useAdminNav() {
  return useContext(AdminNavContext);
}

export function AdminContentArea({ children }: { children: React.ReactNode }) {
  const { resetKey } = useAdminNav();
  
  return (
    <main key={resetKey} className="flex-grow w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="mx-auto max-w-7xl">
        {children}
      </div>
    </main>
  );
}
