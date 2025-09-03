"use client";

import { useState } from "react";
import { Phone, Globe, Mail, Star, MapPin, Search } from "lucide-react";

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
  const [location, setLocation] = useState("");
  const [keyword, setKeyword] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ location: false, keyword: false });
  const [submitted, setSubmitted] = useState(false);

  const locationError = !location.trim() ? "Location is required" : "";
  const keywordError = !keyword.trim() ? "Keyword is required" : "";
  const hasErrors = !!locationError || !!keywordError;
  const disableBtn = loading || hasErrors;

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ location: true, keyword: true });

    if (!hasErrors) {
      searchPlaces();
    }
  }

  return (
    <div className="w-full bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 drop-shadow-lg leading-tight">
          🔎 Find the Best <span className="text-indigo-600">Places</span> Near You
        </h1>
        <p className="mt-3 text-base sm:text-lg md:text-xl text-gray-700">
          Search by location & keyword to discover hidden gems 🌟
        </p>

        {/* Search Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3 justify-center pb-5"
          noValidate
        >
          {/* Location */}
          <div className="w-full sm:w-auto flex-1 min-w-[200px]">
            <input
              type="text"
              value={location}
              required
              onChange={(e) => setLocation(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, location: true }))}
              placeholder="Enter location"
              aria-invalid={touched.location && !!locationError}
              aria-describedby="location-error"
              className={`w-full px-4 py-3 rounded-xl border shadow-sm bg-white/80 backdrop-blur focus:outline-none focus:ring-2 
                ${touched.location && locationError ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-indigo-500"}
                text-gray-800 placeholder-gray-500`}
            />
            {touched.location && locationError && (
              <p id="location-error" className="mt-1 text-xs text-red-600 text-left">
                {locationError}
              </p>
            )}
          </div>

          {/* Keyword */}
          <div className="w-full sm:w-auto flex-1 min-w-[200px]">
            <input
              type="text"
              value={keyword}
              required
              onChange={(e) => setKeyword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, keyword: true }))}
              placeholder="Keyword (e.g. restaurants)"
              aria-invalid={touched.keyword && !!keywordError}
              aria-describedby="keyword-error"
              className={`w-full px-4 py-3 rounded-xl border shadow-sm bg-white/80 backdrop-blur focus:outline-none focus:ring-2
                ${touched.keyword && keywordError ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-indigo-500"}
                text-gray-800 placeholder-gray-500`}
            />
            {touched.keyword && keywordError && (
              <p id="keyword-error" className="mt-1 text-xs text-red-600 text-left">
                {keywordError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={disableBtn}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 
              bg-indigo-600 text-white font-semibold rounded-xl shadow-md 
              hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            <Search size={18} />
            {loading ? "Loading..." : "Search"}
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pb-16">
        {places.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((p) => (
              <div
                key={p.id}
                className="p-4 sm:p-6 bg-white/90 backdrop-blur rounded-xl shadow-md hover:shadow-xl transition border border-gray-200 flex flex-col"
              >
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 line-clamp-2 break-words">
                  {p.name}
                </h2>
                <p className="flex items-start gap-2 text-gray-600 mb-2 text-xs sm:text-sm truncate">
                  <MapPin size={16} className="text-red-500 shrink-0 mt-1" />
                  <span className="break-words">{p.address}</span>
                </p>
                {p.phone && (
                  <p className="flex items-center gap-2 text-gray-600 mb-1 text-xs sm:text-sm truncate">
                    <Phone size={16} className="text-green-500 shrink-0" />
                    {p.phone}
                  </p>
                )}
                {p.website && (
                  <a
                    href={p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-indigo-600 hover:underline mb-1 text-xs sm:text-sm truncate"
                  >
                    <Globe size={16} /> Website
                  </a>
                )}
                {p.email && (
                  <p className="flex items-center gap-2 text-gray-600 mb-1 text-xs sm:text-sm truncate">
                    <Mail size={16} className="text-blue-500 shrink-0" />
                    {p.email}
                  </p>
                )}
                {p.rating && (
                  <p className="flex items-center gap-2 text-yellow-500 font-medium mt-2 text-xs sm:text-sm">
                    <Star size={16} /> {p.rating}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          !loading &&
          submitted && (
            <p className="text-center text-gray-600 mt-12 text-sm sm:text-base md:text-lg">
              No results found.
            </p>
          )
        )}
      </div>
    </div>
  );
}
