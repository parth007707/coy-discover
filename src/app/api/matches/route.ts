
import { NextResponse } from "next/server";
import { readDatabase } from "@/lib/store";



export async function GET() {
  try {
    const db = await readDatabase();

    const matches = db.swipes
      .filter((swipe) => swipe.action === "like")
      .map((swipe) =>
        db.profiles.find(
          (profile) =>
            profile.id === swipe.profileId && profile.likedYou
        )
      )
      .filter((profile) => profile !== undefined)
      .map((profile) => ({
  id: profile.id,
  name: profile.name,
  age: profile.age,
  city: profile.city,
  bio: profile.bio,
  interests: profile.interests,
  photo: profile.photo,
}));

    return NextResponse.json(matches);
  } catch {
    return NextResponse.json(
      { error: "Unable to load matches" },
      { status: 500 }
    );
  }
}
