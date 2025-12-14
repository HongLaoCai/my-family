// src/context/FamilyContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadFamilyData, FamilyMember } from '@/services/familyStorage';

interface FamilyContextType {
  members: FamilyMember[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType>({
  members: [],
  loading: false,
  error: null,
  refresh: async () => {},
});

export const FamilyProvider = ({ children }: { children: React.ReactNode }) => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await loadFamilyData();
      setMembers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <FamilyContext.Provider value={{ members, loading, error, refresh: fetchMembers }}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => useContext(FamilyContext);
