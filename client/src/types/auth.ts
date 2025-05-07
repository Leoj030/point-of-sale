export interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
