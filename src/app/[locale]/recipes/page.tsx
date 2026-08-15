import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import CategoryList from "@/components/catalog/CategoryList/CategoryList";
import GroupTabs from "@/components/catalog/GroupTabs/GroupTabs";
import IngredientFilter from "@/components/catalog/IngredientFilter/IngredientFilter";
import Pagination from "@/components/catalog/Pagination/Pagination";
import SearchBox from "@/components/catalog/SearchBox/SearchBox";
import CreateRecipeLink from "@/components/recipes/CreateRecipeLink/CreateRecipeLink";
import RecipeCard from "@/components/recipes/RecipeCard/RecipeCard";
import RecipeGrid from "@/components/recipes/RecipeGrid/RecipeGrid";
import { getCategories } from "@/lib/categories";
import { getIngredients } from "@/lib/ingredients";
import { localizedName } from "@/lib/localizedName";
import { getRecipes } from "@/lib/recipes";
import type { Group } from "@/types/recipe";
import styles from "./page.module.css";

const GROUPS: Group[] = ["recipes", "conservation"];
const isGroup = (value: unknown): value is Group => GROUPS.includes(value as Group);

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Navigation");
  return { title: t("recipes") };
}

export default async function RecipesPage({
  searchParams,
}: PageProps<"/[locale]/recipes">) {
  const params = await searchParams;
  const locale = await getLocale();
  const t = await getTranslations("Catalog");

  const groupParam = firstValue(params.group);
  const group = isGroup(groupParam) ? groupParam : undefined;
  const category = firstValue(params.category);
  const ingredient = firstValue(params.ingredient);
  const search = firstValue(params.search);
  const page = Math.max(1, Number(firstValue(params.page)) || 1);
  const perPage = 12;

  const [categories, { data: recipes, totalItems }, selectedIngredient] = await Promise.all([
    getCategories(group),
    getRecipes({ group, category, ingredient, search, page, perPage }),
    ingredient
      ? getIngredients({ lang: locale }).then((all) => all.find((i) => i._id === ingredient))
      : Promise.resolve(undefined),
  ]);

  const categoryNameById = new Map(
    categories.map((c) => [c._id, localizedName(c.name, locale)]),
  );

  const baseQuery: Record<string, string | undefined> = { group, category, ingredient, search };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <GroupTabs activeGroup={group} search={search} />
        <CreateRecipeLink />
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <SearchBox initialValue={search} />
          <IngredientFilter
            locale={locale}
            initialIngredientId={ingredient}
            initialIngredientLabel={
              selectedIngredient ? localizedName(selectedIngredient.name, locale) : undefined
            }
          />
          <div className={styles.categories}>
            <h2 className={styles.categoriesTitle}>{t("categoriesLabel")}</h2>
            <CategoryList
              categories={categories}
              group={group}
              activeCategory={category}
              search={search}
              ingredient={ingredient}
              locale={locale}
            />
          </div>
        </aside>

        <div className={styles.results}>
          {recipes.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>{t("emptyTitle")}</p>
              <p className={styles.emptyDescription}>{t("emptyDescription")}</p>
            </div>
          ) : (
            <>
              <RecipeGrid>
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    categoryName={
                      typeof recipe.category === "string"
                        ? categoryNameById.get(recipe.category)
                        : localizedName(recipe.category.name, locale)
                    }
                  />
                ))}
              </RecipeGrid>
              <Pagination page={page} perPage={perPage} totalItems={totalItems} baseQuery={baseQuery} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
