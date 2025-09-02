export default function HomePage() {
  return (
    <main className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-gray-800">
      <div className="bg-white/70 backdrop-blur-lg p-10 rounded-2xl shadow-lg text-center max-w-lg">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Welcome to <span className="text-blue-600">PlaceFinder 🚀</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Discover the best places near you with just a click!
        </p>
        <button className="mt-6 px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl shadow-md hover:bg-blue-600 transition duration-300">
          Get Started
        </button>
      </div>
    </main>
  );
}
