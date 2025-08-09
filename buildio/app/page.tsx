export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Buildio.pro
          </span>
        </h1>
        <nav className="space-x-6">
          <a href="#" className="hover:text-purple-400 transition-colors">
            Home
          </a>
          <a href="#" className="hover:text-purple-400 transition-colors">
            Projects
          </a>
          <a href="#" className="hover:text-purple-400 transition-colors">
            Contact
          </a>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-4">
        <h2 className="text-5xl sm:text-6xl font-extrabold mb-4">
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-pulse">
            Build Something Epic
          </span>
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mb-8">
          You own the domain. Now own the web. Deploy your projects, showcase
          your skills, and make the internet jealous.
        </p>
        <a
          href="#"
          className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:scale-105 transform transition-all shadow-lg"
        >
          Get Started
        </a>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-500 p-4 text-sm border-t border-gray-800">
        © {new Date().getFullYear()} Buildio.pro — Crafted with ❤️
      </footer>
    </div>
  );
}
