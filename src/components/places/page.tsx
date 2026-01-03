"use client";

import { useState, useRef, useEffect } from "react";
import {
  Phone,
  Globe,
  Mail,
  Star,
  MapPin,
  Search,
  Download,
  Upload,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  TrendingUp,
  ExternalLink,
  BarChart3,
  FileText,
  FileSpreadsheet,
  Layers,
  Grid,
  List,
  Heart,
  Share2,
  Bookmark,
  CheckCircle,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

type Place = {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  rating?: number;
  category?: string;
  price_level?: number;
  opening_hours?: string;
  distance?: string;
  image?: string;
  isFavorite?: boolean;
  tags?: string[];
};

type FilterOptions = {
  minRating: number;
  category: string;
  hasWebsite: boolean;
  hasPhone: boolean;
  hasEmail: boolean;
  priceLevel: string;
  sortBy: string;
};

 

const SORT_OPTIONS = ["Relevance", "Rating", "Price: Low to High", "Price: High to Low", "Name"];


export default function PlacesPage() {
  const [location, setLocation] = useState("");
  const [keyword, setKeyword] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ location: false, keyword: false });
  const [submitted, setSubmitted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    minRating: 0,
    category: "All",
    hasWebsite: false,
    hasPhone: false,
    hasEmail: false,
    priceLevel: "All",
    sortBy: "Relevance"
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const locationError = !location.trim() ? "Location is required" : "";
  const keywordError = !keyword.trim() ? "Keyword is required" : "";
  const hasErrors = !!locationError || !!keywordError;
  const disableBtn = loading || hasErrors;

  // Apply filters and sorting
  const applyFiltersAndSort = (placesList: Place[]) => {
    let filtered = placesList.filter(place => {
      // Rating filter
      if (filters.minRating > 0 && (!place.rating || place.rating < filters.minRating)) {
        return false;
      }

      // Category filter
      if (filters.category !== "All" && place.category !== filters.category) {
        return false;
      }

      // Website filter
      if (filters.hasWebsite && !place.website) {
        return false;
      }

      // Phone filter
      if (filters.hasPhone && !place.phone) {
        return false;
      }

      // Email filter
      if (filters.hasEmail && !place.email) {
        return false;
      }

      // Price level filter
      if (filters.priceLevel !== "All") {
        const priceLevelMap: Record<string, number> = { "$": 1, "$$": 2, "$$$": 3, "$$$$": 4 };
        const targetPriceLevel = priceLevelMap[filters.priceLevel];
        if (!place.price_level || place.price_level !== targetPriceLevel) {
          return false;
        }
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "Rating":
          return (b.rating || 0) - (a.rating || 0);
        case "Price: Low to High":
          return (a.price_level || 0) - (b.price_level || 0);
        case "Price: High to Low":
          return (b.price_level || 0) - (a.price_level || 0);
        case "Name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  };

  async function searchPlaces() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/places?location=${encodeURIComponent(location)}&keyword=${encodeURIComponent(keyword)}`
      );
      if (!res.ok) throw new Error("Failed to fetch places");
      const data = await res.json();
      const placesWithIds = (data.results || []).map((place: any, index: number) => ({
        ...place,
        id: place.id || `place-${index}-${Date.now()}`,
        price_level: place.price_level || Math.floor(Math.random() * 4) + 1,
        distance: `${(Math.random() * 5).toFixed(1)} km`,
        isFavorite: Math.random() > 0.7,
        tags: place.tags || ["Popular", "Trending", "Recommended"].slice(0, Math.floor(Math.random() * 3))
      }));
      setPlaces(placesWithIds);
      setFilteredPlaces(applyFiltersAndSort(placesWithIds));
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

  // Export to CSV
  const exportToCSV = () => {
    const dataToExport = filteredPlaces.length > 0 ? filteredPlaces : places;

    if (dataToExport.length === 0) {
      alert("No data to export!");
      return;
    }

    const headers = ["Name", "Address", "Phone", "Email", "Website", "Rating", "Category", "Price Level"];
    const csvRows = [
      headers.join(","),
      ...dataToExport.map(place => [
        `"${place.name.replace(/"/g, '""')}"`,
        `"${place.address.replace(/"/g, '""')}"`,
        `"${place.phone || ""}"`,
        `"${place.email || ""}"`,
        `"${place.website || ""}"`,
        place.rating || "",
        `"${place.category || ""}"`,
        place.price_level ? "$".repeat(place.price_level) : ""
      ].join(","))
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `places-${location}-${keyword}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const exportToPDF = () => {
    const dataToExport = filteredPlaces.length > 0 ? filteredPlaces : places;

    if (dataToExport.length === 0) {
      alert("No data to export!");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Places in ${location} - ${keyword}`, 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableData = dataToExport.map(place => [
      place.name,
      place.address.substring(0, 40) + (place.address.length > 40 ? "..." : ""),
      place.phone || "N/A",
      place.email || "N/A",
      place.website ? "Yes" : "No",
      place.rating || "N/A",
      place.category || "N/A",
      place.price_level ? "$".repeat(place.price_level) : "N/A"
    ]);

    (doc as any).autoTable({
      head: [["Name", "Address", "Phone", "Email", "Website", "Rating", "Category", "Price"]],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 }
    });

    doc.save(`places-${location}-${keyword}-${new Date().toISOString().split('T')[0]}.pdf`);
  };


  // Handle filter changes
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setFilteredPlaces(applyFiltersAndSort(places));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      minRating: 0,
      category: "All",
      hasWebsite: false,
      hasPhone: false,
      hasEmail: false,
      priceLevel: "All",
      sortBy: "Relevance"
    });
    setFilteredPlaces(places);
  };

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setPlaces(prev => prev.map(p =>
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ));
    setFilteredPlaces(prev => prev.map(p =>
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  // Display places (filtered if available, otherwise all)
  const displayPlaces = filteredPlaces.length > 0 ? filteredPlaces : places;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section with Glassmorphism */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-500/20 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 mb-6 shadow-sm">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Discover Amazing Places</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 leading-tight">
              Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Perfect</span> Places
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
              Search by location & keyword to discover hidden gems, restaurants, cafes, and more in your area
            </p>

            {/* Search Form */}
            <div className="max-w-4xl mx-auto">
              <form
                onSubmit={handleSubmit}
                className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-2 border border-gray-200/50"
              >
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1">
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={location}
                        required
                        onChange={(e) => setLocation(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, location: true }))}
                        placeholder="Enter city, address, or ZIP code"
                        className="w-full pl-12 pr-4 py-4 text-lg bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-400"
                      />
                    </div>
                    {touched.location && locationError && (
                      <p className="text-red-500 text-sm mt-1 px-4">{locationError}</p>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={keyword}
                        required
                        onChange={(e) => setKeyword(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, keyword: true }))}
                        placeholder="What are you looking for? (restaurants, cafes, etc.)"
                        className="w-full pl-12 pr-4 py-4 text-lg bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-400"
                      />
                    </div>
                    {touched.keyword && keywordError && (
                      <p className="text-red-500 text-sm mt-1 px-4">{keywordError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={disableBtn}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2 min-w-[140px]"
                  >
                    {loading ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5" />
                        Search Now
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {places.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Layers className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{places.length}</p>
                  <p className="text-sm text-gray-500">Total Places</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {(places.reduce((acc, p) => acc + (p.rating || 0), 0) / places.length).toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-500">Avg Rating</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {places.filter(p => p.isFavorite).length}
                  </p>
                  <p className="text-sm text-gray-500">Favorites</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-pink-600" />
                </div>
                 
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Controls Bar */}
        {(places.length > 0 || submitted) && (
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Search Results {displayPlaces.length > 0 && `(${displayPlaces.length})`}
                </h2>

                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                  >
                    <Grid className={`h-5 w-5 ${viewMode === "grid" ? "text-blue-600" : "text-gray-500"}`} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                  >
                    <List className={`h-5 w-5 ${viewMode === "list" ? "text-blue-600" : "text-gray-500"}`} />
                  </button>
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-4">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium"
                >
                  <Filter className="h-4 w-4" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
              </div>
            </div>

            {/* Import/Export Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <FileSpreadsheet className="h-5 w-5" />
                Export CSV
              </button>

              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <FileText className="h-5 w-5" />
                Export PDF
              </button>


              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                <Share2 className="h-5 w-5" />
                Share Results
              </button>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && places.length > 0 && (
          <div className="mb-8 animate-slideDown">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Filter & Refine Results</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Showing {filteredPlaces.length} of {places.length} places
                  </p>
                </div>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                >
                  <X className="h-4 w-4" />
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Minimum Rating: <span className="text-blue-600">{filters.minRating}+</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-gray-200 to-blue-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>0</span>
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                  </div>
                </div>


                {/* Checkbox Filters */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Features
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'hasWebsite', label: 'Has Website', color: 'blue' },
                      { key: 'hasPhone', label: 'Has Phone', color: 'green' },
                      { key: 'hasEmail', label: 'Has Email', color: 'purple' },
                    ].map(({ key, label, color }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={filters[key as keyof FilterOptions] as boolean}
                            onChange={(e) => handleFilterChange(key as keyof FilterOptions, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`h-5 w-5 rounded border-2 border-gray-300 peer-checked:border-${color}-500 peer-checked:bg-${color}-500 transition-all group-hover:border-${color}-400`}>
                            <CheckCircle className="h-4 w-4 text-white absolute inset-0 m-auto opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {displayPlaces.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {displayPlaces.map((place) => (
                <div
                  key={place.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1"
                >
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(place.id)}
                      className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all"
                    >
                      <Heart className={`h-5 w-5 ${place.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </button>

                    {/* Price Badge */}
                    {place.price_level && place.price_level > 0 && (
                      <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full">
                        <span className="text-sm font-bold text-gray-900">
                          {"$".repeat(place.price_level)}
                        </span>
                      </div>
                    )}

                    {/* Category Badge */}
                    {place.category && place.category !== "Other" && (
                      <div className="absolute bottom-4 right-4 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                        {place.category}
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-2 flex-1">
                        {place.name}
                      </h3>
                      {place.rating && (
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg ml-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-bold text-gray-900">{place.rating}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <p className="text-sm line-clamp-2">{place.address}</p>
                    </div>

                    {/* Tags */}
                    {place.tags && place.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {place.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2">
                      {place.phone && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{place.phone}</span>
                        </div>
                      )}

                      {place.website && (
                        <a
                          href={place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors group/link"
                        >
                          <Globe className="h-4 w-4" />
                          <span className="text-sm group-hover/link:underline">Visit Website</span>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </a>
                      )}

                      {place.email && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="h-4 w-4 text-blue-500" />
                          <span className="text-sm truncate">{place.email}</span>
                        </div>
                      )}

                      {place.distance && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">{place.distance} away</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
                      <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors">
                        View Details
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <Bookmark className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-4">
              {displayPlaces.map((place) => (
                <div
                  key={place.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 p-6"
                >
                  <div className="flex flex-col lg:flex-row gap-6">

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{place.name}</h3>
                          </div>

                          <div className="flex items-center gap-4 mb-4">
                            {place.category && place.category !== "Other" && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                {place.category}
                              </span>
                            )}

                            {place.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-bold text-gray-900">{place.rating}</span>
                                <span className="text-gray-500 text-sm">/5</span>
                              </div>
                            )}

                            {place.distance && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span className="text-sm">{place.distance} away</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => toggleFavorite(place.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Heart className={`h-5 w-5 ${place.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                        </button>
                      </div>

                      <div className="flex items-start gap-2 text-gray-600 mb-4">
                        <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{place.address}</p>
                      </div>

                      {/* Contact Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {place.phone && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{place.phone}</span>
                          </div>
                        )}

                        {place.website && (
                          <a
                            href={place.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <Globe className="h-4 w-4" />
                            <span className="text-sm hover:underline">Website</span>
                          </a>
                        )}

                        {place.email && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Mail className="h-4 w-4 text-blue-500" />
                            <span className="text-sm truncate">{place.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {place.tags && place.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {place.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                          Get Directions
                        </button>
                        <button className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                          Save for Later
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          !loading &&
          submitted && (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="h-24 w-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-600 mb-8">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Clear Filters & Try Again
                </button>
              </div>
            </div>
          )
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-lg text-gray-700">Searching for the best places...</p>
            <p className="text-sm text-gray-500 mt-2">This might take a moment</p>
          </div>
        )}
      </div>
    </div>
  );
}