export default function HomePage() {
  return (
    <main className="flex items-center justify-center h-screen bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
      <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl text-center max-w-lg">
        <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-lg">
          Welcome to <span className="text-yellow-300">PlaceFinder 🚀</span>
        </h1>
        <p className="mt-4 text-lg opacity-90">
          Discover the best places near you with just a click!
        </p>
        <button className="mt-6 px-6 py-3 bg-yellow-400 text-black font-semibold rounded-xl shadow-md hover:bg-yellow-500 transition duration-300">
          Get Started
        </button>
      </div>
    </main>
  );
}
