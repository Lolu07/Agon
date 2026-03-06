"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Users, GraduationCap, Star, Trophy,
  Github, Linkedin, Globe, Filter, Wifi, WifiOff,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { mockProfiles } from "@/lib/mockData";
import { StudentProfile, Rank } from "@/types";
import Button from "@/components/ui/Button";

const RANK_CONFIG: Record<Rank, { label: string; color: string; bg: string; border: string; icon: string }> = {
  bronze:   { label: "Bronze",   color: "text-orange-400", bg: "bg-orange-500/10",  border: "border-orange-500/30",  icon: "🥉" },
  silver:   { label: "Silver",   color: "text-gray-300",   bg: "bg-gray-500/10",    border: "border-gray-500/30",    icon: "🥈" },
  gold:     { label: "Gold",     color: "text-yellow-400", bg: "bg-yellow-500/10",  border: "border-yellow-500/30",  icon: "🥇" },
  platinum: { label: "Platinum", color: "text-cyan-400",   bg: "bg-cyan-500/10",    border: "border-cyan-500/30",    icon: "💎" },
  elite:    { label: "Elite",    color: "text-violet-400", bg: "bg-violet-500/10",  border: "border-violet-500/30",  icon: "⚡" },
};

const RANK_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All ranks" },
  { value: "elite", label: "⚡ Elite" },
  { value: "platinum", label: "💎 Platinum" },
  { value: "gold", label: "🥇 Gold" },
  { value: "silver", label: "🥈 Silver" },
  { value: "bronze", label: "🥉 Bronze" },
];

export default function TalentPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [fetching, setFetching] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const [skillFilter, setSkillFilter] = useState("");
  const [rankFilter, setRankFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Debounced inputs for API calls
  const [appliedSkill, setAppliedSkill] = useState("");
  const [appliedRank, setAppliedRank] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth");
    if (!isLoading && user && user.role !== "company") router.push("/student");
  }, [user, isLoading, router]);

  // Load profiles whenever applied filters change
  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const params = new URLSearchParams();
        if (appliedSkill) params.set("skill", appliedSkill);
        if (appliedRank) params.set("rank", appliedRank);
        if (appliedSearch) params.set("search", appliedSearch);
        const { data } = await api.get(`/profiles/?${params.toString()}`);
        setProfiles(data.results || data);
        setUsingMock(false);
      } catch {
        // Filter mock profiles client-side as fallback
        let filtered = mockProfiles;
        if (appliedSkill) {
          filtered = filtered.filter((p) =>
            p.skills.toLowerCase().includes(appliedSkill.toLowerCase())
          );
        }
        if (appliedRank) {
          filtered = filtered.filter((p) => p.rank === appliedRank);
        }
        if (appliedSearch) {
          const q = appliedSearch.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.user.first_name.toLowerCase().includes(q) ||
              p.user.last_name.toLowerCase().includes(q) ||
              p.university.toLowerCase().includes(q)
          );
        }
        setProfiles(filtered);
        setUsingMock(true);
      } finally {
        setFetching(false);
      }
    };
    if (user) load();
  }, [user, appliedSkill, appliedRank, appliedSearch]);

  const applyFilters = () => {
    setAppliedSkill(skillFilter);
    setAppliedRank(rankFilter);
    setAppliedSearch(searchQuery);
  };

  const clearFilters = () => {
    setSkillFilter("");
    setRankFilter("");
    setSearchQuery("");
    setAppliedSkill("");
    setAppliedRank("");
    setAppliedSearch("");
  };

  const hasActiveFilters = appliedSkill || appliedRank || appliedSearch;

  if (isLoading || !user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Find Talent</h1>
          <p className="text-gray-400 mt-1">
            Discover students who&apos;ve competed and proved their skills.
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
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-sm">
            <Users size={14} className="text-violet-400" />
            {profiles.length} student{profiles.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-gray-900 border border-gray-800 p-5 mb-8">
        <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-400">
          <Filter size={14} /> Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Name or university…"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Skill */}
          <div className="relative">
            <Star size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Skill (e.g. Python, React)…"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Rank */}
          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-violet-500"
          >
            {RANK_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" onClick={applyFilters}>
            <Search size={13} /> Search
          </Button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {fetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl bg-gray-900 border border-gray-800 p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-800" />
                <div className="flex-1">
                  <div className="h-4 w-2/3 bg-gray-800 rounded mb-2" />
                  <div className="h-3 w-1/2 bg-gray-800 rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-gray-800 rounded mb-2" />
              <div className="h-3 w-5/6 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-gray-900 border border-gray-800 border-dashed">
          <Users size={40} className="mx-auto mb-4 text-gray-700" />
          <p className="text-gray-400 font-medium mb-2">No students found</p>
          <p className="text-gray-600 text-sm mb-5">
            {hasActiveFilters
              ? "Try adjusting your filters."
              : "Students will appear here once they create profiles."}
          </p>
          {hasActiveFilters && (
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {profiles.map((profile) => {
            const cfg = RANK_CONFIG[profile.rank];
            return (
              <div
                key={profile.id}
                className="rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors p-6 flex flex-col"
              >
                {/* Top */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-lg font-black text-violet-400">
                    {profile.user.first_name?.[0] || profile.user.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-semibold text-white text-sm truncate">
                        {profile.user.first_name} {profile.user.last_name}
                      </p>
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    {profile.university && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                        <GraduationCap size={11} />
                        {profile.university}
                        {profile.graduation_year && ` · ${profile.graduation_year}`}
                      </div>
                    )}
                  </div>
                </div>

                {/* XP */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                  <Trophy size={11} className="text-yellow-500" />
                  {profile.xp} XP
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                    {profile.bio}
                  </p>
                )}

                {/* Skills */}
                {profile.skills_list.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {profile.skills_list.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-400 border border-gray-700"
                      >
                        {skill}
                      </span>
                    ))}
                    {profile.skills_list.length > 4 && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-600 border border-gray-700">
                        +{profile.skills_list.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Social icons */}
                <div className="flex items-center gap-2 mb-4">
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-300 transition-colors">
                      <Github size={15} />
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-300 transition-colors">
                      <Linkedin size={15} />
                    </a>
                  )}
                  {profile.portfolio_url && (
                    <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-300 transition-colors">
                      <Globe size={15} />
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/students/${profile.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      View Profile
                    </Button>
                  </Link>
                  <a href={`mailto:${profile.user.email}`}>
                    <Button size="sm">
                      Invite
                    </Button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
