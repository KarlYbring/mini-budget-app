export interface Category {
  id: number;
  name: string;
}

export interface Transaction {
  id: number;
  date: string;
  amount: number;
  type: "income" | "expense";
  description: string;
  category: Category;
  categoryId?: number; // Om du använder categoryId vid POST
}