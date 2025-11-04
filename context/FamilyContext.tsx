// src/context/FamilyContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

interface FamilyMember {
  id: number;
  full_name: string;
  gender: string;
  birth_date: string | null;
  death_date: string | null;
  father_id: number | null;
  mother_id: number | null;
  spouse_id: number | null;
  notes: string | null;
}

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

const API_BASE_URL = 'http://localhost:8080';

export const FamilyProvider = ({ children }: { children: React.ReactNode }) => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/list-all-family-members`);
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
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
