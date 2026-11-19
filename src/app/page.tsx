
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  X,
  MapPin,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Navbar from "@/components/Navbar";

type Tab = "Home" | "Discover" | "Matches" | "Profile";

type Profile = {
  id: number;
  name: string;
  age: number;
  city: string;
  bio: string;
  interests: string[];
  photo: string;
};

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Discover");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<Profile[]>([]);
  const [newMatch, setNewMatch] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [direction, setDirection] = useState(0);

  async function loadFeed() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/feed", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load profiles");
      }

      const data: Profile[] = await response.json();
      setProfiles(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  

  useEffect(() => {
  let cancelled = false;

  fetch("/api/feed", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Unable to load profiles");
      }
      return (await response.json()) as Profile[];
    })
    .then((data) => {
      if (!cancelled) setProfiles(data);
    })
    .catch((err) => {
      if (!cancelled) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      }
    })
    .finally(() => {
      if (!cancelled) setLoading(false);
    });

  return () => {
    cancelled = true;
  };
}, []);

useEffect(() => {
  if (activeTab !== "Matches") return;

  let cancelled = false;

  fetch("/api/matches", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Unable to load matches");
      }
      return (await response.json()) as Profile[];
    })
    .then((data) => {
      if (!cancelled) setMatches(data);
    })
    .catch(() => {
      if (!cancelled) setError("Unable to load your matches");
    });

  return () => {
    cancelled = true;
  };
}, [activeTab]);

  async function handleSwipe(action: "like" | "pass") {
    const currentProfile = profiles[0];

    if (!currentProfile || busy) return;

    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/swipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId: currentProfile.id,
          action,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Swipe failed");
      }

      setDirection(action === "like" ? 1 : -1);

      setProfiles((previous) =>
        previous.filter((profile) => profile.id !== currentProfile.id)
      );

      if (result.match && result.matchedProfile) {
        setNewMatch(result.matchedProfile);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save swipe"
      );
    } finally {
      setBusy(false);
    }
  }

  const currentProfile = profiles[0];

  return (
    <main className="min-h-screen bg-[#101123] pb-28 text-white">

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div>
          <h1 className="text-3xl font-black">
            coy<span className="text-pink-400">.</span>
          </h1>
          <p className="text-xs text-gray-400">
            Real connections start here
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
          <Sparkles size={16} className="text-pink-400" />
          <span className="text-sm">{activeTab}</span>
        </div>
      </header>

      <section className="mx-auto max-w-xl px-5">

        {activeTab === "Home" && (
          <div className="py-20 text-center text-gray-400">
            Home
          </div>
        )}

        {activeTab === "Profile" && (
          <div className="py-20 text-center">
            <h2 className="text-2xl font-bold">Your Profile</h2>
            <p className="mt-2 text-gray-400">
              Profile management coming soon.
            </p>
          </div>
        )}

        {activeTab === "Discover" && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Discover people
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Real connections start here.
                </p>
              </div>

              <span className="rounded-full bg-white/10 px-3 py-2 text-xs">
                {profiles.length} left
              </span>
            </div>

            {loading ? (
              <div className="flex h-[490px] items-center justify-center">
                <Loader2 className="animate-spin text-pink-400" size={36} />
              </div>
            ) : error && profiles.length === 0 ? (
              <div className="rounded-3xl bg-white/5 p-8 text-center">
                <p className="text-red-400">{error}</p>
                <button
                  onClick={loadFeed}
                  className="mt-5 rounded-full bg-pink-500 px-5 py-3"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <div className="relative h-[490px] w-full max-w-[370px] mx-auto">
                  <AnimatePresence mode="wait">
                    {currentProfile ? (
                      <motion.div
                        key={currentProfile.id}
                        drag={busy ? false : "x"}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.8}
                        onDragEnd={(_, info) => {
                          if (info.offset.x > 100) {
                            handleSwipe("like");
                          } else if (info.offset.x < -100) {
                            handleSwipe("pass");
                          }
                        }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{
                          opacity: 0,
                          x: direction * 300,
                          rotate: direction * 15,
                        }}
                        className="absolute inset-0 cursor-grab overflow-hidden rounded-3xl border border-white/10 bg-[#202139] shadow-2xl active:cursor-grabbing"
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${currentProfile.photo})`,
                          }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                        <div className="absolute bottom-0 w-full p-6">
                          <span className="mb-3 inline-block rounded-full bg-pink-500 px-3 py-1 text-xs font-semibold">
                            ✨ New discovery
                          </span>

                          <h3 className="text-4xl font-bold">
                            {currentProfile.name}, {currentProfile.age}
                          </h3>

                          <p className="mt-2 flex items-center gap-2 text-sm">
                            <MapPin size={15} />
                            {currentProfile.city}
                          </p>

                          <p className="mt-3 text-sm text-gray-200">
                            {currentProfile.bio}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {currentProfile.interests.map((interest) => (
                              <span
                                key={interest}
                                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
                        <Sparkles size={45} className="mb-5 text-pink-400" />
                        <h3 className="text-2xl font-bold">
                          You&apos;re all caught up!
                        </h3>
                        <p className="mt-3 text-sm text-gray-400">
                          No more profiles available right now.
                        </p>
                        <button
                          onClick={loadFeed}
                          className="mt-6 flex items-center gap-2 rounded-full bg-pink-500 px-6 py-3 font-semibold"
                        >
                          <RefreshCw size={17} />
                          Refresh feed
                        </button>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {currentProfile && (
                  <div className="mt-6 flex justify-center gap-8">
                    <button
                      disabled={busy}
                      onClick={() => handleSwipe("pass")}
                      className="flex h-16 w-16 items-center justify-center rounded-full border border-red-400/30 bg-red-500/10 text-red-400 transition hover:scale-110 disabled:opacity-50"
                    >
                      <X size={30} />
                    </button>

                    <button
                      disabled={busy}
                      onClick={() => handleSwipe("like")}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-500 text-white shadow-lg shadow-pink-500/30 transition hover:scale-110 disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Heart size={29} fill="currentColor" />
                      )}
                    </button>
                  </div>
                )}

                {error && (
                  <p className="mt-3 text-center text-sm text-red-400">
                    {error}
                  </p>
                )}

                <p className="mt-5 text-center text-xs text-gray-500">
                  Swipe right to like · Swipe left to pass
                </p>
              </>
            )}
          </>
        )}

        {activeTab === "Matches" && (
          <div>
            <h2 className="mb-2 text-2xl font-bold">Your Matches 💗</h2>
            <p className="mb-6 text-sm text-gray-400">
              People who liked you back.
            </p>

            {matches.length === 0 ? (
              <div className="rounded-3xl bg-white/5 p-10 text-center">
                <Heart size={40} className="mx-auto text-pink-400" />
                <h3 className="mt-4 text-xl font-bold">
                  No matches yet
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  Keep discovering to find your connection.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {matches.map((profile) => (
                  <div
                    key={profile.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                  >
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${profile.photo})`,
                      }}
                    />
                    <div className="p-3">
                      <h3 className="font-bold">
                        {profile.name}, {profile.age}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {profile.city}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <Navbar
        activeTab={activeTab}
        onNavigate={setActiveTab}
      />

      {newMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-pink-400/30 bg-[#202139] p-8 text-center shadow-2xl">
            <div className="mb-5 text-5xl">💗</div>

            <h2 className="text-3xl font-black text-pink-300">
              It&apos;s a match!
            </h2>

            <p className="mt-3 text-gray-300">
              You and {newMatch.name} liked each other.
            </p>

            <button
              onClick={() => {
                setNewMatch(null);
                setActiveTab("Matches");
              }}
              className="mt-7 w-full rounded-full bg-pink-500 py-3 font-bold"
            >
              View matches
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
