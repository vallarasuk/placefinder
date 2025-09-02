// src/app/page.tsx
import Header from "@/components/layout/Header";
import PlacesPage from "@/components/places/page";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-gray-800">
      {/* Sticky Header */}
      <Header showPlaces={true} />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 md:px-10 py-10">
        <div className="w-full max-w-7xl">
          <PlacesPage />
        </div>
      </main>
    </div>
  );
}
