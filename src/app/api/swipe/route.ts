
import { NextRequest, NextResponse } from "next/server";
import { readDatabase, writeDatabase } from "@/lib/store";



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const profileId = Number(body.profileId);
    const action = body.action;

    if (
      !Number.isInteger(profileId) ||
      !["like", "pass"].includes(action)
    ) {
      return NextResponse.json(
        { error: "Invalid swipe data" },
        { status: 400 }
      );
    }

    const db = await readDatabase();

    const profile = db.profiles.find(
      (item) => item.id === profileId
    );

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const alreadySwiped = db.swipes.some(
      (swipe) => swipe.profileId === profileId
    );

    if (alreadySwiped) {
      return NextResponse.json(
        { error: "Profile already swiped" },
        { status: 409 }
      );
    }

    db.swipes.push({ profileId, action });

    const isMatch = action === "like" && profile.likedYou;

    await writeDatabase(db);

    return NextResponse.json({
      success: true,
      match: isMatch,
      matchedProfile: isMatch
        ? {
            id: profile.id,
            name: profile.name,
            photo: profile.photo,
          }
        : null,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to save swipe" },
      { status: 500 }
    );
  }
}

