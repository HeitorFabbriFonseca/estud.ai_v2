import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, UserPreference } from "@shared/schema";

interface UserContextType {
  user: User | null;
  userPreferences: UserPreference | null;
  isLoading: boolean;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  userPreferences: null,
  isLoading: true,
  refetchUser: async () => {},
});

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  // Query for the current user
  const { 
    data: userData, 
    isLoading: isLoadingUser,
    refetch: refetchUserData
  } = useQuery<{ user: User; preferences: UserPreference }>({
    queryKey: ['/api/user/current'],
  });

  const refetchUser = async () => {
    await refetchUserData();
  };

  return (
    <UserContext.Provider 
      value={{ 
        user: userData?.user || null, 
        userPreferences: userData?.preferences || null,
        isLoading: isLoadingUser,
        refetchUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
