export type AuthActionState = {
  errors?: {
    email?: string;
    name?: string;
    password?: string;
  };
  message?: string;
  values?: {
    email?: string;
    name?: string;
  };
};

export const authActionInitialState: AuthActionState = {};
