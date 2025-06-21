import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { User, LoginData } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("auth_token")
  );
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }, [token]);

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user/profile"],
    enabled: !!token,
    queryFn: async () => {
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      return response.json();
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["/api/user/profile"], data.user);
      navigate("/dashboard");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["/api/user/profile"], data.user);
      navigate("/dashboard");
    },
  });

  const login = async (data: LoginData) => {
    await loginMutation.mutateAsync(data);
  };

  const register = async (data: any) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = () => {
    setToken(null);
    queryClient.clear();
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
        login,
        register,
        logout,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}