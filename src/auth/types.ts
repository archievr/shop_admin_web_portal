export type UserType = Record<string, any> | null;

export type AuthState = {
  user: UserType;
  loading: boolean;
  token: string;
};

export type AuthContextValue = {
  user: UserType;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  checkUserSession?: () => Promise<void>;
};
