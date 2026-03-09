"use client";

import { useState } from "react";
import { Search, Bell, HelpCircle, ChevronDown } from "lucide-react";

export default function TopBar() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 shrink-0">
      {/* ── Page title ── */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[#072435] font-semibold text-[15px] truncate">Dashboard</h1>
      </div>

      {/* ── Search ── */}
      <div
        className={`hidden md:flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-2 transition-all duration-150 ${searchFocused ? "border-[#409EF2] bg-white shadow-sm shadow-[#409EF2]/10 w-64" : "border-gray-200 w-48"
          }`}
      >
        <Search size={14} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="bg-transparent text-[13px] text-gray-700 placeholder-gray-400 outline-none w-full"
        />
        {!searchFocused && (
          <kbd className="hidden lg:inline text-[10px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-1">
        {/* Help */}
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <HelpCircle size={17} />
        </button>

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#409EF2]" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* User */}
        <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#409EF2] to-[#072435] flex items-center justify-center">
            <span className="text-white text-[11px] font-bold">S</span>
          </div>
          <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
