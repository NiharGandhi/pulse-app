import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  if (!ref) return new Response("Missing ref", { status: 400 });

  const key = process.env["NEXT_PUBLIC_GOOGLE_PLACES_API_KEY"] ?? "";
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${encodeURIComponent(ref)}&key=${key}`;

  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return new Response("Photo not found", { status: 404 });
    const buffer = await res.arrayBuffer();
    return new Response(buffer, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return new Response("Failed to fetch photo", { status: 502 });
  }
}
