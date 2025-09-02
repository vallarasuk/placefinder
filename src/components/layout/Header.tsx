import Image from "next/image"
import Link from "next/link"
import Logo from "../../assest/lo.png"

const Header = ({ showPlaces = false }) => {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 shadow overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <Link href="/" passHref>
            <Image 
              src={Logo} 
              alt="Logo" 
              width={50}    
              height={50}  
              className="object-contain rounded-full shadow cursor-pointer"
            />
          </Link>
        </div>

        {/* Right side – CTA or Places */}
        <div>
          {showPlaces ? (
            <Link 
              href="/" passHref 
              className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-xl shadow hover:bg-indigo-700 transition"
            >
              Explore Places
            </Link>
          ) : (
            <button className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded-xl shadow hover:bg-gray-100 transition">
              Get Started
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
