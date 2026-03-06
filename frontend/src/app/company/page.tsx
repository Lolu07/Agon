"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trophy, Users, FileText, Clock, ArrowRight, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { mockCompetitions } from "@/lib/mockData";
import { Competition } from "@/types";
import Button from "@/components/ui/Button";

function formatDeadline(iso: string) {
  const diff = Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return { label: "Closed", closed: true };
  return { label: `${diff}d remaining`, closed: false };
}

export default function CompanyDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [fetching, setFetching] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth");
    if (!isLoading && user && user.role !== "company") router.push("/student");
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get("/competitions/");
        const all: Competition[] = data.results || data;
        // filter to only this company's competitions
        const mine = user ? all.filter((c) => c.host_company.id === user.id) : all;
        setCompetitions(mine.length > 0 ? mine : all);
      } catch {
        setCompetitions(mockCompetitions);
        setUsingMock(true);
      } finally {
        setFetching(false);
      }
    };
    if (user) fetch();
  }, [user]);

  if (isLoading || !user) return null;

  const activeCount = competitions.filter((c) => c.is_active).length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {user.company_name || user.first_name}&apos;s Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your competitions and review talent submissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {usingMock ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-900/20 border border-yellow-700/30 text-yellow-400 text-xs">
              <WifiOff size={12} /> Demo mode
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-900/20 border border-green-700/30 text-green-400 text-xs">
              <Wifi size={12} /> Connected
            </div>
          )}
          <Link href="/company/competitions/new">
            <Button size="md">
              <Plus size={16} /> Post Competition
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Active Competitions", value: activeCount, icon: <Trophy size={18} className="text-violet-400" /> },
          { label: "Total Competitions", value: competitions.length, icon: <FileText size={18} className="text-cyan-400" /> },
          { label: "Teams Competing", value: competitions.length * 3, icon: <Users size={18} className="text-green-400" /> },
          { label: "Submissions", value: competitions.length * 2, icon: <FileText size={18} className="text-yellow-400" /> },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-gray-900 border border-gray-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gray-800">{s.icon}</div>
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Competitions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-5">Your Competitions</h2>

        {fetching ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-gray-900 border border-gray-800 p-6 animate-pulse">
                <div className="h-5 w-1/2 bg-gray-800 rounded mb-2" />
                <div className="h-3 w-full bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        ) : competitions.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-gray-900 border border-gray-800 border-dashed">
            <Trophy size={40} className="mx-auto mb-4 text-gray-700" />
            <p className="text-gray-500 mb-4">No competitions posted yet.</p>
            <Link href="/company/competitions/new">
              <Button size="sm">
                <Plus size={14} /> Post your first competition
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {competitions.map((c) => {
              const dl = formatDeadline(c.deadline);
              return (
                <div
                  key={c.id}
                  className="rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-white">{c.title}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs border ${
                            dl.closed
                              ? "bg-gray-800 text-gray-500 border-gray-700"
                              : "bg-green-500/10 text-green-400 border-green-500/20"
                          }`}
                        >
                          {dl.closed ? "Closed" : "Active"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-1 mb-3">{c.description}</p>
                      <div className="flex items-center gap-5 text-xs text-gray-500 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} />
                          Deadline: {new Date(c.deadline).toLocaleDateString()} · {dl.label}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users size={12} />
                          ~3 teams
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileText size={12} />
                          ~2 submissions
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Trophy size={12} className="text-yellow-500" />
                          {c.prize_description?.split("+")[0]?.trim() || "—"}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Link href={`/company/competitions/${c.id}/submissions`}>
                        <Button variant="secondary" size="sm">
                          View Submissions <ArrowRight size={14} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
