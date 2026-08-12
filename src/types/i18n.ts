// uk is the required fallback locale for the curated category/ingredient
// dictionary; en/ka are optional until an admin translates them.
export interface MultilingualName {
  uk: string;
  en?: string;
  ka?: string;
}
