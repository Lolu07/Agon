"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Github, Linkedin, Globe, FileText, ExternalLink,
  GraduationCap, Star, Trophy, Mail,
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

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/profiles/${id}/`);
        setProfile(data);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          setNotFound(true);
        } else {
          const mock = mockProfiles.find((p) => p.id === parseInt(id)) || mockProfiles[0];
          setProfile(mock);
        }
      } finally {
        setFetching(false);
      }
    };
    if (id) load();
  }, [id]);

  const backHref = user?.role === "company" ? "/company/talent" : "/student";

  if (fetching) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-gray-900 border border-gray-800 p-6 animate-pulse">
            <div className="h-5 w-1/3 bg-gray-800 rounded mb-3" />
            <div className="h-3 w-full bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-gray-400 text-lg font-medium mb-2">Profile not found</p>
        <p className="text-gray-600 text-sm mb-6">This student hasn&apos;t set up a profile yet.</p>
        <Link href={backHref}>
          <Button variant="secondary" size="sm">
            <ArrowLeft size={14} /> Go back
          </Button>
        </Link>
      </div>
    );
  }

  if (!profile) return null;

  const rank = profile.rank;
  const cfg = RANK_CONFIG[rank];
  const isOwnProfile = user?.id === profile.user.id;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="space-y-5">
        {/* Identity */}
        <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-2xl font-black text-violet-400">
              {profile.user.first_name?.[0] || profile.user.email[0].toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-white">
                  {profile.user.first_name} {profile.user.last_name}
                </h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                  {cfg.icon} {cfg.label}
                </span>
              </div>
              {profile.university && (
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <GraduationCap size={13} />
                  {profile.university}
                  {profile.graduation_year && ` · Class of ${profile.graduation_year}`}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <Trophy size={12} className="text-yellow-500" />
                {profile.xp} XP
              </div>
            </div>

            {/* Actions — only show for company viewers */}
            {user?.role === "company" && (
              <div className="flex flex-col gap-2 shrink-0">
                <a href={`mailto:${profile.user.email}`}>
                  <Button size="sm">
                    <Mail size={14} /> Invite to Interview
                  </Button>
                </a>
              </div>
            )}
            {isOwnProfile && (
              <Link href="/student/profile/edit">
                <Button variant="secondary" size="sm">Edit Profile</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
            <h2 className="text-sm font-semibold text-white mb-3">About</h2>
            <p className="text-gray-300 text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Skills */}
        {profile.skills_list.length > 0 && (
          <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star size={15} className="text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">Skills</h2>
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
        {(profile.github_url || profile.linkedin_url || profile.portfolio_url || profile.resume_url || profile.transcript_url) && (
          <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Links & Documents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { url: profile.github_url, icon: <Github size={15} />, label: "GitHub" },
                { url: profile.linkedin_url, icon: <Linkedin size={15} />, label: "LinkedIn" },
                { url: profile.portfolio_url, icon: <Globe size={15} />, label: "Portfolio" },
                { url: profile.resume_url, icon: <FileText size={15} />, label: "Resume" },
                { url: profile.transcript_url, icon: <GraduationCap size={15} />, label: "Transcript" },
              ]
                .filter((l) => l.url)
                .map(({ url, icon, label }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-600 text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="text-violet-400">{icon}</span>
                    {label}
                    <ExternalLink size={11} className="ml-auto text-gray-600" />
                  </a>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
