export function Header() {
    return (
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo / Title */}
          <h2 className="text-2xl font-bold text-white tracking-wide">
            PlaceFinder
          </h2>
  
          {/* Navigation */}
          {/* <nav className="space-x-6 hidden md:flex">
            <a
              href="#"
              className="text-white hover:text-gray-200 font-medium transition"
            >
              Home
            </a>
            <a
              href="#"
              className="text-white hover:text-gray-200 font-medium transition"
            >
              Explore
            </a>
            <a
              href="#"
              className="text-white hover:text-gray-200 font-medium transition"
            >
              About
            </a>
            <a
              href="#"
              className="text-white hover:text-gray-200 font-medium transition"
            >
              Contact
            </a>
          </nav>
   */}
          {/* CTA Button */}
          <button className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded-xl shadow hover:bg-gray-100 transition">
            Get Started
          </button>
        </div>
      </header>
    );
  }
  