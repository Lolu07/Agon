"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Menu, X, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import clsx from "clsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const studentLinks = [
    { href: "/student", label: "Dashboard" },
    { href: "/student/profile", label: "My Profile" },
  ];

  const companyLinks = [
    { href: "/company", label: "Dashboard" },
    { href: "/company/talent", label: "Find Talent" },
    { href: "/company/competitions/new", label: "Post Competition" },
  ];

  const publicLinks = [
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#competitions", label: "Browse" },
  ];

  const links = user?.role === "student"
    ? studentLinks
    : user?.role === "company"
    ? companyLinks
    : publicLinks;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-800 bg-gray-950/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 group-hover:bg-violet-500 transition-colors">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">Agon</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className={clsx(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === l.href
                    ? "text-white bg-gray-800"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800">
                  <User size={14} className="text-violet-400" />
                  <span className="text-sm text-gray-200">
                    {user.first_name || user.email}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    · {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/auth"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white transition-colors"
                >
                  Sign up →
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-800 mt-3">
            {user ? (
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <LogOut size={14} /> Logout
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/auth" onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 text-sm text-center text-gray-400 hover:text-white border border-gray-700 rounded-lg">
                  Log in
                </Link>
                <Link href="/auth" onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 text-sm text-center font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
