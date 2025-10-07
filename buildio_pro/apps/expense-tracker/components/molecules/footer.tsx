export function Footer() {
  return (
    <footer className="py-6 text-center text-sm text-slate-500">
      © {new Date().getFullYear()} Expense Tracker — Built with ❤️ using
      Next.js, TRPC, Drizzle & ShadCN
    </footer>
  );
}
