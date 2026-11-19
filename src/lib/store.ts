
import { promises as fs } from "fs";
import path from "path";

export type Profile = {
  id: number;
  name: string;
  age: number;
  city: string;
  bio: string;
  interests: string[];
  photo: string;
  likedYou: boolean;
};

type Database = {
  profiles: Profile[];
  swipes: { profileId: number; action: "like" | "pass" }[];
};

const dbPath = path.join(process.cwd(), "data", "coy-db.json");

const people = [
  "Aarav", "Ananya", "Rohan", "Ishita", "Kabir",
  "Meera", "Arjun", "Priya", "Vihaan", "Aditi",
  "Reyansh", "Saanvi", "Aditya", "Kiara", "Ishaan",
  "Diya", "Advait", "Myra", "Krish", "Sara",
  "Dev", "Tara", "Yash", "Riya", "Neil",
  "Aanya", "Veer", "Kavya", "Aman", "Nisha",
];

const cities = ["Delhi", "Gurgaon", "Noida", "Ghaziabad"];
const interests = [
  ["Travel", "Music", "Photography"],
  ["Reading", "Art", "Coffee"],
  ["Fitness", "Coding", "Movies"],
  ["Food", "Nature", "Dancing"],
];

function seedProfiles(): Profile[] {
  return people.map((name, index) => ({
    id: index + 1,
    name,
    age: 21 + (index % 5),
    city: cities[index % cities.length],
    bio: [
      "Exploring new places and collecting memories.",
      "Coffee lover with a creative side.",
      "Looking for meaningful conversations.",
      "Enjoying music, food and little adventures.",
    ][index % 4],
    interests: interests[index % interests.length],
    photo: `https://i.pravatar.cc/700?img=${12 + index}`,
    likedYou: [1, 3, 6, 10, 15, 21].includes(index + 1),
  }));
}

async function ensureDatabase(): Promise<void> {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });

  try {
    await fs.access(dbPath);
  } catch {
    const initialData: Database = {
      profiles: seedProfiles(),
      swipes: [],
    };

    await fs.writeFile(dbPath, JSON.stringify(initialData, null, 2));
  }
}

export async function readDatabase(): Promise<Database> {
  await ensureDatabase();

  const content = await fs.readFile(dbPath, "utf8");
  return JSON.parse(content) as Database;
}

export async function writeDatabase(db: Database): Promise<void> {
  await ensureDatabase();
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
}
