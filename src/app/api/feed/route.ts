
import { NextResponse } from "next/server";
import { readDatabase } from "@/lib/store";



export async function GET() {
  try {
    const db = await readDatabase();

    const swipedIds = new Set(
      db.swipes.map((swipe) => swipe.profileId)
    );

    const feed = db.profiles
      .filter((profile) => !swipedIds.has(profile.id))
      .map((profile) => ({
  id: profile.id,
  name: profile.name,
  age: profile.age,
  city: profile.city,
  bio: profile.bio,
  interests: profile.interests,
  photo: profile.photo,
}));

    return NextResponse.json(feed);
  } catch {
    return NextResponse.json(
      { error: "Unable to load feed" },
      { status: 500 }
    );
  }
}
