import { IncomeSourceFormComponent } from "@/components/organisms/income-source";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { incomeSource } from "@/lib/db/schema/income.schema";

interface EditIncomeSourcePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditIncomeSourcePage({
  params: paramsPromise,
}: EditIncomeSourcePageProps) {
  const params = await paramsPromise;
  const source = await db.query.incomeSource.findFirst({
    where: eq(incomeSource.id, params.id),
  });

  if (!source) {
    redirect("/income-sources");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Edit Income Source
        </h1>
        <p className="text-muted-foreground mt-2">
          Update income source details
        </p>
      </div>

      <IncomeSourceFormComponent
        mode="edit"
        sourceId={params.id}
        initialValues={{
          name: source.name,
          description: source.description || "",
        }}
      />
    </div>
  );
}
