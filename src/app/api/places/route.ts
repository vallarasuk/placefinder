// app/api/places/route.ts
import { NextResponse } from "next/server";

const SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const DETAILS_URL = "https://places.googleapis.com/v1/places/"; // append {placeId}?key=...
const API_KEY = process.env.GOOGLE_PLACES_API_KEY as string;

if (!API_KEY) {
  throw new Error("GOOGLE_PLACES_API_KEY is not defined in environment");
}

// ---------- Types ----------
interface GooglePlace {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
}

interface PlaceDetail {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  location?: { latitude?: number; longitude?: number };
}

export interface Place {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  rating?: number;
  lat?: number;
  lng?: number;
}
interface SearchRequestBody {
  textQuery: string;
  pageSize: number;
  pageToken?: string;
}

// ---------- Helpers ----------
async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Fetch failed: ${res.status} ${res.statusText} ${text}`);
  }
  return res.json() as Promise<T>;
}

async function extractEmail(website?: string): Promise<string> {
  if (!website) return "";
  try {
    // follow redirects and get text
    const res = await fetch(website, { redirect: "follow" });
    if (!res.ok) return "";
    const text = await res.text();
    const match = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    return match ? match[0] : "";
  } catch {
    return "";
  }
}

/**
 * Fetches all pages of the text search result by following nextPageToken.
 * Returns an array of GooglePlace objects (may be large depending on API).
 */
async function searchAllPlaces(query: string) {
  const allPlaces: GooglePlace[] = [];
  let pageToken: string | undefined = undefined;

  const pageSize = 20;

  do {
    const body: SearchRequestBody = { textQuery: query, pageSize };
    if (pageToken) body.pageToken = pageToken;

    const resp = await fetch(SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Search API failed: ${resp.status} ${resp.statusText} ${text}`);
    }

    const data = (await resp.json()) as {
      places?: GooglePlace[];
      nextPageToken?: string;
    };
    allPlaces.push(...(data.places ?? []));
    pageToken = data.nextPageToken;

    if (pageToken) await sleep(2000);
  } while (pageToken);

  return allPlaces;
}


/**
 * Fetch place details in batches (controlled concurrency).
 * Accepts array of GooglePlace (with id) and returns PlaceDetail[] in same order (null for failures).
 */
async function fetchDetailsInBatches(places: GooglePlace[], batchSize = 10) {
  const results: (PlaceDetail | null)[] = [];

  for (let i = 0; i < places.length; i += batchSize) {
    const chunk = places.slice(i, i + batchSize);
    const promises = chunk.map(async (p) => {
      try {
        // Use query params for key & fields for details endpoint
        const fields =
          "id,displayName,formattedAddress,internationalPhoneNumber,websiteUri,rating,location";
        const url = `${DETAILS_URL}${encodeURIComponent(p.id)}?key=${encodeURIComponent(API_KEY)}&fields=${encodeURIComponent(
          fields
        )}`;
        const detail = await fetchJson<PlaceDetail>(url, { method: "GET" });
        return detail;
      } catch (err) {
        console.warn(`Details fetch failed for ${p.id}:`, err instanceof Error ? err.message : err);
        return null;
      }
    });

    const resolved = await Promise.all(promises);
    results.push(...resolved);

    // Small delay between batches to be kind to the API (and reduce spikes)
    await sleep(200);
  }

  return results;
}

// ---------- Route ----------
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location") || "New York, USA";
  const keyword = searchParams.get("keyword") || "business";
  const query = `${keyword} in ${location}`;

  try {
    // 1) Get all search results (auto-paginate)
    const places = await searchAllPlaces(query);

    // If no places found, return early
    if (!places.length) {
      return NextResponse.json({ results: [] });
    }

    // 2) Fetch details in batches (controlled concurrency)
    const detailsArr = await fetchDetailsInBatches(places, 20); // batch size 20

    // 3) Build final results. Keep only successful details
    const results: Place[] = [];

    const seen = new Set<string>();

    for (let i = 0; i < places.length; i++) {
      const detail = detailsArr[i];
      if (!detail) continue;
    
      const email = await extractEmail(detail.websiteUri);
    
      const key = detail.id || `${detail.displayName?.text}-${detail.formattedAddress}`;
      if (seen.has(key)) continue; 
      seen.add(key);
    
      results.push({
        id: detail.id,
        name: detail.displayName?.text || "",
        address: detail.formattedAddress || "",
        phone: detail.internationalPhoneNumber || "",
        website: detail.websiteUri || "",
        email,
        rating: detail.rating,
        lat: detail.location?.latitude,
        lng: detail.location?.longitude,
      });
    }
    

    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    console.error("Places route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
