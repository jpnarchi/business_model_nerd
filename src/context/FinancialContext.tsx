import React, { createContext, useContext, useState } from 'react';

interface FinancialContextType {
  monthlyViews: number[];
  setMonthlyViews: (views: number[]) => void;
  totalRevenue: number;
  setTotalRevenue: (revenue: number) => void;
  totalExpenses: number;
  setTotalExpenses: (expenses: number) => void;
  registeredUsers: number;
  setRegisteredUsers: (users: number) => void;
  paidUsers: number;
  setPaidUsers: (users: number) => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [monthlyViews, setMonthlyViews] = useState([
    100801, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1100000, 1200000
  ]);
  const [totalRevenue, setTotalRevenue] = useState(265630);
  const [totalExpenses, setTotalExpenses] = useState(157851.09);
  const [registeredUsers, setRegisteredUsers] = useState(0);
  const [paidUsers, setPaidUsers] = useState(0);

  return (
    <FinancialContext.Provider value={{
      monthlyViews,
      setMonthlyViews,
      totalRevenue,
      setTotalRevenue,
      totalExpenses,
      setTotalExpenses,
      registeredUsers,
      setRegisteredUsers,
      paidUsers,
      setPaidUsers
    }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};