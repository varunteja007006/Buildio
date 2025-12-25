import { IncomeFormComponent } from "@/components/organisms/income";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { income } from "@/lib/db/schema/income.schema";

interface EditIncomePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditIncomePage({
  params: paramsPromise,
}: EditIncomePageProps) {
  const params = await paramsPromise;
  const income_record = await db.query.income.findFirst({
    where: eq(income.id, params.id),
  });

  if (!income_record) {
    redirect("/income");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Income</h1>
        <p className="text-muted-foreground mt-2">Update income details</p>
      </div>

      <IncomeFormComponent
        mode="edit"
        incomeId={params.id}
        initialValues={{
          name: income_record.name || "",
          incomeAmount: income_record.incomeAmount.toString(),
          sourceId: income_record.sourceId || "",
          paymentMethodId: income_record.paymentMethodId || "",
        }}
      />
    </div>
  );
}
