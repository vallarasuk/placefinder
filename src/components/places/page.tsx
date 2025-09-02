"use client";

import { useState } from "react";
import {
  Phone,
  Globe,
  Mail,
  Star,
  MapPin,
  Search,
} from "lucide-react";

type Place = {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  rating?: number;
};

export default function PlacesPage() {
  const [location, setLocation] = useState("New York, USA");
  const [keyword, setKeyword] = useState("business");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  async function searchPlaces() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/places?location=${encodeURIComponent(location)}&keyword=${encodeURIComponent(keyword)}`
      );
      if (!res.ok) throw new Error("Failed to fetch places");
      const data = await res.json();
      setPlaces(data.results || []);
    } catch (err) {
      console.error("Error fetching places:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 drop-shadow-lg leading-tight">
          🔎 Find the Best{" "}
          <span className="text-indigo-600">Places</span> Near You
        </h1>
        <p className="mt-3 text-base sm:text-lg md:text-xl text-gray-700">
          Search by location & keyword to discover hidden gems 🌟
        </p>

        {/* Search Form */}
        <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3 justify-center pb-5">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
            className="w-full sm:w-auto flex-1 min-w-[200px] px-4 py-3 rounded-xl border border-gray-300 shadow-sm 
              text-gray-800 placeholder-gray-500 focus:outline-none 
              focus:ring-2 focus:ring-indigo-500 bg-white/80 backdrop-blur"
          />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Keyword (e.g. restaurants)"
            className="w-full sm:w-auto flex-1 min-w-[200px] px-4 py-3 rounded-xl border border-gray-300 shadow-sm 
              text-gray-800 placeholder-gray-500 focus:outline-none 
              focus:ring-2 focus:ring-indigo-500 bg-white/80 backdrop-blur"
          />
          <button
            onClick={searchPlaces}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 
              bg-indigo-600 text-white font-semibold rounded-xl shadow-md 
              hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            <Search size={18} />
            {loading ? "Loading..." : "Search"}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pb-16">
        {places.length > 0 ? (
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((p) => (
              <div
                key={p.id}
                className="p-5 sm:p-6 bg-white/90 backdrop-blur rounded-2xl shadow-lg 
                  hover:shadow-2xl transition border border-gray-200"
              >
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {p.name}
                </h2>
                <p className="flex items-center gap-2 text-gray-600 mb-3 text-sm sm:text-base">
                  <MapPin size={16} className="text-red-500 shrink-0" />{" "}
                  <span className="truncate">{p.address}</span>
                </p>
                {p.phone && (
                  <p className="flex items-center gap-2 text-gray-600 mb-2 text-sm sm:text-base">
                    <Phone size={16} className="text-green-500 shrink-0" />{" "}
                    {p.phone}
                  </p>
                )}
                {p.website && (
                  <a
                    href={p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-indigo-600 hover:underline mb-2 text-sm sm:text-base"
                  >
                    <Globe size={16} /> Website
                  </a>
                )}
                {p.email && (
                  <p className="flex items-center gap-2 text-gray-600 mb-2 text-sm sm:text-base">
                    <Mail size={16} className="text-blue-500 shrink-0" />{" "}
                    {p.email}
                  </p>
                )}
                {p.rating && (
                  <p className="flex items-center gap-2 text-yellow-500 font-medium mt-3 text-sm sm:text-base">
                    <Star size={16} /> {p.rating}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <p className="text-center text-gray-600 mt-12 text-base sm:text-lg md:text-xl">
              {/* No results found. */}
            </p>
          )
        )}
      </div>
    </div>
  );
}
