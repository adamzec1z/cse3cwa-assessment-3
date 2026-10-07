"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6">

        <div className="flex items-center justify-between py-5">

          {/* Logo / Title */}
          <div>
            <Link
              href="/"
              onClick={closeMenu}
              className="block"
            >
              <h1 className="text-xl font-bold text-blue-700">
                Phoneme Activity Builder
              </h1>
            </Link>

            <p className="text-sm text-slate-500">
              Speech Pathology Classroom Tool
            </p>
          </div>

          {/* Desktop navigation */}
          <nav
            className="hidden gap-6 text-sm font-medium text-slate-900 md:flex"
            aria-label="Main navigation"
          >
            <Link
              href="/"
              className="hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Home
            </Link>

            <Link
              href="/wordle"
              className="hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Wordle
            </Link>

            <Link
              href="/word-search"
              className="hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Word Search
            </Link>

            <Link
              href="/about"
              className="hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              About
            </Link>

            <Link
              href="/settings"
              className="hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Settings
            </Link>

            <Link
              href="/dashboard"
              className="hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Dashboard
            </Link>
          </nav>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 md:hidden"
          >
            {menuOpen ? (
              <span className="text-2xl">
                ×
              </span>
            ) : (
              <span className="text-2xl">
                ☰
              </span>
            )}
          </button>

        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav
            id="mobile-menu"
            aria-label="Mobile navigation"
            className="border-t border-slate-200 pb-5 pt-4 md:hidden"
          >
            <div className="flex flex-col gap-2">

              <Link
                href="/"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 font-medium text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"              >
                Home
              </Link>

              <Link
                href="/wordle"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 font-medium text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                Wordle
              </Link>

              <Link
                href="/word-search"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 font-medium text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                Word Search
              </Link>

              <Link
                href="/about"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 font-medium text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                About
              </Link>

              <Link
                href="/settings"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 font-medium hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                Settings
              </Link>

              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 font-medium text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                Dashboard
              </Link>

            </div>
          </nav>
        )}

      </div>
    </header>
  );
}