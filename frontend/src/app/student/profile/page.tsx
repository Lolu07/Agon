"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Edit3, Github, Linkedin, Globe, FileText, ExternalLink,
  Trophy, Zap, GraduationCap, Star,
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

const XP_NEXT: Record<Rank, number> = {
  bronze: 200, silver: 500, gold: 1000, platinum: 2000, elite: 2000,
};

function XPBar({ xp, rank }: { xp: number; rank: Rank }) {
  const thresholds: Record<Rank, number> = {
    bronze: 0, silver: 200, gold: 500, platinum: 1000, elite: 2000,
  };
  const start = thresholds[rank];
  const end = XP_NEXT[rank];
  const progress = rank === "elite" ? 100 : Math.min(100, ((xp - start) / (end - start)) * 100);
  const cfg = RANK_CONFIG[rank];

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
        <span>{xp} XP</span>
        {rank !== "elite" && <span>Next rank at {end} XP</span>}
        {rank === "elite" && <span className="text-violet-400">Max rank reached</span>}
      </div>
      <div className="h-2 w-full rounded-full bg-gray-800">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${cfg.color.replace("text-", "bg-")}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function StudentProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [fetching, setFetching] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth");
    if (!isLoading && user && user.role !== "student") router.push("/company");
  }, [user, isLoading, router]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/profiles/me/");
        setProfile(data);
      } catch (err: unknown) {
        // 404 = no profile yet — that's fine, show empty state
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status !== 404) {
          // network/auth error — fall back to mock
          const mock = mockProfiles.find((p) => p.user.email === user?.email) || mockProfiles[0];
          setProfile(mock);
          setUsingMock(true);
        }
      } finally {
        setFetching(false);
      }
    };
    if (user) load();
  }, [user]);

  if (isLoading || !user) return null;

  const rank = profile?.rank ?? "bronze";
  const cfg = RANK_CONFIG[rank];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-gray-400 text-sm mt-1">Your public student profile visible to companies.</p>
        </div>
        <div className="flex items-center gap-3">
          {usingMock && (
            <span className="text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-700/30 px-2.5 py-1 rounded-lg">
              Demo mode
            </span>
          )}
          <Link href="/student/profile/edit">
            <Button size="sm">
              <Edit3 size={14} /> Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {fetching ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-gray-900 border border-gray-800 p-6 animate-pulse">
              <div className="h-5 w-1/3 bg-gray-800 rounded mb-3" />
              <div className="h-3 w-full bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : !profile ? (
        /* Empty state */
        <div className="text-center py-20 rounded-2xl bg-gray-900 border border-gray-800 border-dashed">
          <User size={40} className="mx-auto mb-4 text-gray-700" />
          <p className="text-gray-400 font-medium mb-2">No profile yet</p>
          <p className="text-gray-600 text-sm mb-6">
            Set up your profile so companies can discover you.
          </p>
          <Link href="/student/profile/edit">
            <Button size="sm">
              <Edit3 size={14} /> Create Profile
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Identity card */}
          <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
            <div className="flex items-start gap-5 flex-wrap">
              {/* Avatar placeholder */}
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-2xl font-black text-violet-400">
                {user.first_name?.[0] || user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h2 className="text-xl font-bold text-white">
                    {user.first_name} {user.last_name}
                  </h2>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">{user.email}</p>
                {profile.university && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-1">
                    <GraduationCap size={14} />
                    {profile.university}
                    {profile.graduation_year && ` · Class of ${profile.graduation_year}`}
                  </div>
                )}
              </div>
              <Link
                href={`/students/${profile.id}`}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
              >
                <ExternalLink size={12} /> Public view
              </Link>
            </div>
          </div>

          {/* XP / Rank */}
          <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={16} className="text-yellow-500" />
              <h3 className="font-semibold text-white text-sm">Rank & XP</h3>
            </div>
            <XPBar xp={profile.xp} rank={rank} />
            <p className="text-xs text-gray-600 mt-3">
              XP is awarded when your team places in a competition.
            </p>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-3">
                <User size={16} className="text-gray-400" />
                <h3 className="font-semibold text-white text-sm">About</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Skills */}
          {profile.skills_list.length > 0 && (
            <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star size={16} className="text-cyan-400" />
                <h3 className="font-semibold text-white text-sm">Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills_list.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={16} className="text-gray-400" />
              <h3 className="font-semibold text-white text-sm">Links</h3>
            </div>
            <div className="space-y-3">
              {[
                { url: profile.github_url, icon: <Github size={15} />, label: "GitHub" },
                { url: profile.linkedin_url, icon: <Linkedin size={15} />, label: "LinkedIn" },
                { url: profile.portfolio_url, icon: <Globe size={15} />, label: "Portfolio" },
                { url: profile.resume_url, icon: <FileText size={15} />, label: "Resume" },
                { url: profile.transcript_url, icon: <GraduationCap size={15} />, label: "Transcript" },
              ].map(({ url, icon, label }) =>
                url ? (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <span className="text-gray-500">{icon}</span>
                    {label}
                    <ExternalLink size={11} className="text-gray-600" />
                  </a>
                ) : (
                  <div key={label} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <span>{icon}</span>
                    {label}
                    <span className="text-xs text-gray-700">— not set</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
