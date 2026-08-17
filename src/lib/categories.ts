import { api } from "@/lib/api";
import type { MultilingualName } from "@/types/i18n";
import type { Category, Group } from "@/types/recipe";

export async function getCategories(group?: Group): Promise<Category[]> {
  const query = group ? `?group=${group}` : "";
  const { categories } = await api.get<{ categories: Category[] }>(`/categories${query}`);
  return categories;
}

export interface CategoryFields {
  name: MultilingualName;
  group: Group;
}

function buildCategoryFormData(fields: Partial<CategoryFields>, imageFile: File | null): FormData {
  const formData = new FormData();
  if (fields.name !== undefined) formData.set("name", JSON.stringify(fields.name));
  if (fields.group !== undefined) formData.set("group", fields.group);
  if (imageFile) formData.set("image", imageFile);
  return formData;
}

export async function createCategory(fields: CategoryFields, imageFile: File | null): Promise<Category> {
  const { category } = await api.post<{ category: Category }>(
    "/categories",
    buildCategoryFormData(fields, imageFile),
  );
  return category;
}

export async function updateCategory(
  id: string,
  fields: Partial<CategoryFields>,
  imageFile: File | null,
): Promise<Category> {
  const { category } = await api.patch<{ category: Category }>(
    `/categories/${id}`,
    buildCategoryFormData(fields, imageFile),
  );
  return category;
}

export function deleteCategory(id: string): Promise<void> {
  return api.delete<void>(`/categories/${id}`);
}
