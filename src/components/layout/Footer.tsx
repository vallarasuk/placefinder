export function Footer() {
    return (
      <footer className="p-4 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 text-center shadow">
        <p className="text-gray-700 font-medium">
          © {new Date().getFullYear()} PlaceFinder. All rights reserved.
        </p>
      </footer>
    );
  }
  