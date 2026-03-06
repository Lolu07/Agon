"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trophy, Search, Clock, ArrowRight, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { mockCompetitions } from "@/lib/mockData";
import { Competition } from "@/types";

function formatDeadline(iso: string) {
  const diff = Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return { label: "Closed", color: "text-red-400" };
  if (diff <= 3) return { label: `${diff}d left`, color: "text-red-400" };
  if (diff <= 7) return { label: `${diff}d left`, color: "text-yellow-400" };
  return { label: `${diff}d left`, color: "text-green-400" };
}

export default function StudentDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth");
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const { data } = await api.get("/competitions/");
        setCompetitions(data.results || data);
      } catch {
        setCompetitions(mockCompetitions);
        setUsingMock(true);
      } finally {
        setFetching(false);
      }
    };
    fetchCompetitions();
  }, []);

  const filtered = competitions.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.host_company.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading || !user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {user.first_name || "Competitor"} 👋
            </h1>
            <p className="text-gray-400 mt-1">
              Browse active competitions and form your team.
            </p>
          </div>
          {usingMock && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-900/20 border border-yellow-700/30 text-yellow-400 text-xs">
              <WifiOff size={12} /> Demo mode — backend not connected
            </div>
          )}
          {!usingMock && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-900/20 border border-green-700/30 text-green-400 text-xs">
              <Wifi size={12} /> Connected to API
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { label: "Active Competitions", value: competitions.filter((c) => c.is_active).length },
            { label: "Your Teams", value: 0 },
            { label: "Submissions", value: 0 },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-gray-900 border border-gray-800 p-5">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search competitions, companies..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Competition feed */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-5">
          {search ? `Results for "${search}"` : "Active Competitions"}
        </h2>

        {fetching ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl bg-gray-900 border border-gray-800 p-6 animate-pulse">
                <div className="h-3 w-24 bg-gray-800 rounded mb-3" />
                <div className="h-5 w-3/4 bg-gray-800 rounded mb-2" />
                <div className="h-3 w-full bg-gray-800 rounded mb-1" />
                <div className="h-3 w-5/6 bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Trophy size={40} className="mx-auto mb-4 opacity-30" />
            <p>No competitions found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c) => {
              const dl = formatDeadline(c.deadline);
              return (
                <div
                  key={c.id}
                  className="group flex flex-col rounded-2xl bg-gray-900 border border-gray-800 hover:border-violet-700/50 transition-all p-6"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-xs font-medium text-violet-400 block mb-1">
                        {c.host_company.company_name}
                      </span>
                      <h3 className="font-semibold text-white leading-snug">{c.title}</h3>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                      Active
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 line-clamp-3 mb-5 flex-1">{c.description}</p>

                  <div className="space-y-2 pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Trophy size={12} className="text-yellow-500 shrink-0" />
                      <span className="truncate">{c.prize_description}</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${dl.color}`}>
                      <Clock size={12} className="shrink-0" />
                      {dl.label} · {new Date(c.deadline).toLocaleDateString()}
                    </div>
                  </div>

                  <Link
                    href={`/student/competitions/${c.id}`}
                    className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-gray-800 hover:bg-violet-600 text-gray-300 hover:text-white border border-gray-700 hover:border-violet-600 transition-all"
                  >
                    View Challenge <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
