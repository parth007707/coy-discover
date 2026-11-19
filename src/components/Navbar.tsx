
"use client";

import {
  Compass,
  Heart,
  Home,
  UserRound,
} from "lucide-react";

type Tab = "Home" | "Discover" | "Matches" | "Profile";

type NavbarProps = {
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
};

export default function Navbar({
  activeTab,
  onNavigate,
}: NavbarProps) {
  const tabs = [
    { name: "Home" as Tab, icon: Home },
    { name: "Discover" as Tab, icon: Compass },
    { name: "Matches" as Tab, icon: Heart },
    { name: "Profile" as Tab, icon: UserRound },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-white/10 bg-[#111326]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-around px-3 py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.name;

          return (
            <button
              key={tab.name}
              onClick={() => onNavigate(tab.name)}
              className={`flex flex-col items-center gap-1 text-xs transition ${
                selected
                  ? "text-pink-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon size={22} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
