export type AccountFormState = {
  entityId?: string;
  errors?: Partial<
    Record<
      "currentBalance" | "institution" | "name" | "startingBalance" | "type",
      string
    >
  >;
  message?: string;
  status?: "error" | "success";
};

export const initialAccountFormState: AccountFormState = {};
