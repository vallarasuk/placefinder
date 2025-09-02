// app/api/places/route.ts
import { NextResponse } from "next/server";

const SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const DETAILS_URL = "https://places.googleapis.com/v1/places/";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY as string;

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

// ---------- Helpers ----------
async function fetchJson<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function extractEmail(website?: string): Promise<string> {
  if (!website) return "";
  try {
    const res = await fetch(website, { next: { revalidate: 0 } });
    if (!res.ok) return "";
    const text = await res.text();
    const match = text.match(
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/
    );
    return match ? match[0] : "";
  } catch {
    return "";
  }
}

// ---------- Route ----------
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location") || "New York, USA";
  const keyword = searchParams.get("keyword") || "business";
  const query = `${keyword} in ${location}`;

  try {
    // Step 1: Search places
    const searchData = await fetchJson<{ places?: GooglePlace[] }>(SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating",
      },
      body: JSON.stringify({ textQuery: query, pageSize: 10 }),
    });

    const places = searchData.places ?? [];

    // Step 2: For each place, fetch details
    const results: Place[] = await Promise.all(
      places.map(async (p) => {
        const detail = await fetchJson<PlaceDetail>(`${DETAILS_URL}${p.id}`, {
          headers: {
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask":
              "id,displayName,formattedAddress,internationalPhoneNumber,websiteUri,rating,location",
          },
        });

        const email = await extractEmail(detail.websiteUri);

        return {
          id: detail.id,
          name: detail.displayName?.text || "",
          address: detail.formattedAddress || "",
          phone: detail.internationalPhoneNumber || "",
          website: detail.websiteUri || "",
          email,
          rating: detail.rating,
          lat: detail.location?.latitude,
          lng: detail.location?.longitude,
        };
      })
    );

    return NextResponse.json({ results });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
