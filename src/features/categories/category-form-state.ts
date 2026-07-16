export type CategoryFormState = {
  entityId?: string;
  errors?: Partial<Record<"color" | "iconToken" | "name" | "type", string>>;
  message?: string;
  status?: "error" | "success";
};

export const initialCategoryFormState: CategoryFormState = {};
