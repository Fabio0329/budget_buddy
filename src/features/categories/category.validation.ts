import type { CategoryType } from "@/server/generated/prisma/enums";

const categoryTypes: Record<string, CategoryType> = {
  expense: "EXPENSE",
  income: "INCOME",
};

export function validateCategoryForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const type = categoryTypes[String(formData.get("type") ?? "")];
  const color = String(formData.get("color") ?? "").trim().toUpperCase();
  const icon = String(formData.get("iconToken") ?? "").trim().toUpperCase();
  const errors: Record<string, string> = {};

  if (!name) errors.name = "Category name is required.";
  else if (name.length > 80) errors.name = "Use 80 characters or fewer.";

  if (!type) errors.type = "Choose a valid category type.";
  if (!/^#[0-9A-F]{6}$/.test(color)) errors.color = "Choose a valid color.";
  if (!/^[A-Z0-9]{1,2}$/.test(icon)) {
    errors.iconToken = "Use one or two letters or numbers.";
  }

  if (Object.keys(errors).length > 0 || !type) {
    return { errors };
  }

  return { data: { color, icon, name, type } };
}
