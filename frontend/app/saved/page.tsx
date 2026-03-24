"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Bookmark } from "lucide-react";
import { getSavedVenues, type Venue } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { PlaceCard, PlaceCardGrid, PlaceCardSkeleton } from "@/components/venue/PlaceCard";
import { PlaceModal, type ModalPlace } from "@/components/venue/PlaceModal";

export default function SavedPage() {
  const { token } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalPlace, setModalPlace] = useState<ModalPlace | null>(null);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    getSavedVenues(token).then((res) => {
      if (res.success) setVenues(res.data);
      setLoading(false);
    });
  }, [token]);

  return (
    <div className="min-h-screen pb-24 md:pb-0" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Navbar />

      <div className="px-5 md:px-8 pt-8 max-w-2xl mx-auto">
        <p className="label-muted mb-2">Your List</p>
        <h1 className="font-display italic font-bold text-3xl mb-1">Saved places</h1>
        <p className="text-sm font-body mb-7" style={{ color: "var(--text-2)" }}>
          Your curated collection
        </p>

        {loading ? (
          <PlaceCardGrid>
            {[1, 2, 3, 4].map((i) => <PlaceCardSkeleton key={i} />)}
          </PlaceCardGrid>
        ) : venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{ background: "var(--lime-bg)", border: "1px solid var(--border)" }}
            >
              <Bookmark size={22} style={{ color: "var(--lime-text)" }} />
            </div>
            <h2 className="font-display font-bold text-xl mb-2">Nothing saved yet</h2>
            <p className="text-sm font-body max-w-xs" style={{ color: "var(--text-2)" }}>
              Bookmark venues from the feed to build your collection.
            </p>
          </div>
        ) : (
          <PlaceCardGrid>
            {venues.map((venue) => (
              <PlaceCard
                key={venue.id}
                card={{
                  id: venue.id,
                  name: venue.name,
                  area: venue.area,
                  googleRating: venue.googleRating,
                  photoReference: venue.photoReference,
                  category: venue.category,
                  onClick: () => setModalPlace({
                    googlePlaceId: venue.googlePlaceId,
                    name: venue.name,
                    area: venue.area,
                    googleRating: venue.googleRating,
                    photoReference: venue.photoReference,
                    category: venue.category,
                    dbVenueId: venue.id,
                  }),
                }}
              />
            ))}
          </PlaceCardGrid>
        )}
      </div>
      {modalPlace && (
        <PlaceModal place={modalPlace} onClose={() => setModalPlace(null)} />
      )}
    </div>
  );
}
