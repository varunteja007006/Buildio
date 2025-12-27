import { ExpenseCategoryFormComponent } from "@/components/organisms/expense-category";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { expenseCategory } from "@/lib/db/schema/expenses.schema";

interface EditExpenseCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditExpenseCategoryPage({
  params: paramsPromise,
}: EditExpenseCategoryPageProps) {
  const params = await paramsPromise;
  const category = await db.query.expenseCategory.findFirst({
    where: eq(expenseCategory.id, params.id),
  });

  if (!category) {
    redirect("/expense-categories");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Edit Expense Category
        </h1>
        <p className="text-muted-foreground mt-2">
          Update expense category details
        </p>
      </div>

      <ExpenseCategoryFormComponent
        mode="edit"
        categoryId={params.id}
        initialValues={{
          name: category.name,
          description: category.description || "",
        }}
      />
    </div>
  );
}
