import { db, dbSchema } from "@/lib/db";

export default async function CheckDBConnection() {
  const res = await db.execute("select 'Hello World' as message");
  const users = await db
    .select({
      name: dbSchema.user.name,
      email: dbSchema.user.email,
    })
    .from(dbSchema.user);
    
  return (
    <div className="text-sm font-mono space-y-2 bg-card rounded-lg shadow border">
      <pre className="p-2">Drizzle Users: {JSON.stringify(users, null, 2)}</pre>
      <pre className="p-2">Drizzle output: {JSON.stringify(res.rows, null, 2)}</pre>
    </div>
  );
}
