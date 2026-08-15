export interface User {
  accessToken: string;
}

export interface UserState {
  user: User | null;
  hasHydrated: boolean;
}

export interface UserActions {
  setCredentials: (user: User) => void;
  removeCredentials: () => void;
}

export interface UserStoreState extends UserState {
  actions: UserActions;
}
