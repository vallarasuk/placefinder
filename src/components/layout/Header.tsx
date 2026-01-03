import Image from "next/image"
import Link from "next/link"
import Logo from "../../assest/lo.png"

const Header = ({ showPlaces = false }) => {
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Background gradient with subtle animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-x-24 -top-24 h-64 w-[200%] rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>

      {/* Main header content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Logo section with hover effects */}
          <Link 
            href="/" 
            className="group flex items-center gap-3 hover:scale-105 transition-transform duration-300"
          >
            {/* Glowing logo container */}
            <div className="relative">
              {/* Outer glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
              
              {/* Logo image with inner shadow */}
              <div className="relative h-12 w-12 sm:h-14 sm:w-14 bg-white rounded-full p-1 shadow-lg">
                <Image 
                  src={Logo} 
                  alt="PlaceFinder Logo" 
                  width={56}
                  height={56}
                  className="object-contain rounded-full"
                />
              </div>
            </div>

            {/* Brand name with gradient text */}
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">
                PlaceFinder
              </h1>
              <p className="text-xs text-white/70">Discover Amazing Places</p>
            </div>
          </Link>

          {/* CTA button with rich effects */}
          {showPlaces ? (
            <Link 
              href="/"
              className="group relative overflow-hidden rounded-xl px-6 py-3 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              {/* Button background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-white to-indigo-100 opacity-10 group-hover:opacity-20 transition-opacity" />
              
              {/* Animated border */}
              <div className="absolute inset-0 rounded-xl border-2 border-white/30 group-hover:border-white/50 transition-colors" />
              
              {/* Shine effect */}
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div className="absolute -inset-x-24 -top-24 h-64 w-[200%] rotate-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
              
              {/* Text */}
              <span className="relative flex items-center gap-2 text-white">
                <svg 
                  className="h-5 w-5 animate-pulse" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
                Explore Places
              </span>
            </Link>
          ) : (
            <button className="group relative overflow-hidden rounded-xl bg-white px-6 py-3 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95">
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              
              {/* Animated border */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-indigo-300 transition-colors" />
              
              {/* Shine effect */}
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div className="absolute -inset-x-24 -top-24 h-64 w-[200%] rotate-12 bg-gradient-to-r from-transparent via-indigo-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
              
              {/* Text with gradient */}
              <span className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Get Started
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header