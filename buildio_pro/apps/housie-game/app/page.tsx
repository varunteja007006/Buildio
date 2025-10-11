import HousieNumGenerator from "@/components/housie-num-generator";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Buildio.pro
          </span>
        </h1>
        <nav className="space-x-6"></nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-4">
        <HousieNumGenerator />
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-500 p-4 text-sm border-t border-gray-800">
        © {new Date().getFullYear()} Buildio.pro — Crafted with ❤️
      </footer>
    </div>
  );
}
