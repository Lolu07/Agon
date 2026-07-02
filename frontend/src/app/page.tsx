"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Trophy, Users, Building2, CheckCircle, Code2, ChevronRight } from "lucide-react";
import { mockCompetitions } from "@/lib/mockData";
import AgonLogo from "@/components/Logo";

function formatDeadline(iso: string) {
  const diff = Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? `${diff} days left` : "Closed";
}

const ACTIVITIES = [
  "Alex M. joined Neural Squad · 2m ago",
  "TechCorp posted a new challenge · 5m ago",
  "Priya K. earned Gold rank · 12m ago",
  "ByteBuilders submitted their project · 18m ago",
  "BuildHub is reviewing this week's submissions · 25m ago",
];

const RANKS = [
  { label: "Bronze",   xp: "0 XP",    color: "text-orange-400", bg: "bg-orange-500/10",  border: "border-orange-500/30",  icon: "🥉" },
  { label: "Silver",   xp: "200 XP",  color: "text-gray-300",   bg: "bg-gray-500/10",    border: "border-gray-500/30",    icon: "🥈" },
  { label: "Gold",     xp: "500 XP",  color: "text-yellow-400", bg: "bg-yellow-500/10",  border: "border-yellow-500/30",  icon: "🥇" },
  { label: "Platinum", xp: "1000 XP", color: "text-cyan-400",   bg: "bg-cyan-500/10",    border: "border-cyan-500/30",    icon: "💎" },
  { label: "Elite",    xp: "2000 XP", color: "text-violet-400", bg: "bg-violet-500/10",  border: "border-violet-500/30",  icon: "⚡" },
];

function ActivityTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % ACTIVITIES.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
      </span>
      <p
        key={index}
        className="text-sm text-gray-500 animate-fade-in"
      >
        {ACTIVITIES[index]}
      </p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="animate-blob absolute -top-48 -left-32 w-[500px] h-[500px] bg-violet-700/25 rounded-full blur-3xl" />
          <div className="animate-blob animation-delay-2000 absolute top-20 right-[-100px] w-[400px] h-[400px] bg-cyan-600/15 rounded-full blur-3xl" />
          <div className="animate-blob animation-delay-4000 absolute bottom-0 left-1/3 w-[350px] h-[350px] bg-indigo-600/15 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center w-full">
          {/* Logo mark */}
          <div className="flex justify-center mb-8">
            <AgonLogo size={64} />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-300 text-sm mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            The competitive hiring platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight text-white mb-6 leading-none">
            Compete.<br />
            <span className="gradient-text">Get Hired.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed">
            Agon — from the Greek word for contest. Companies post real challenges.
            Students form teams, build, and earn their place.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-900/50 hover:shadow-violet-900/70 hover:-translate-y-0.5"
            >
              Start Competing <ArrowRight size={18} />
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-gray-800/80 hover:bg-gray-700 text-white border border-gray-700 hover:border-gray-600 transition-all hover:-translate-y-0.5"
            >
              <Building2 size={18} /> Post a Challenge
            </Link>
          </div>

          <ActivityTicker />
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-gray-800 bg-gray-900/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: "1,200+", label: "Students competing",  icon: "👩‍💻" },
              { value: "80+",    label: "Companies hiring",    icon: "🏢" },
              { value: "340+",   label: "Competitions hosted", icon: "🏆" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="text-2xl mb-1">{s.icon}</span>
                <div className="text-3xl sm:text-4xl font-black text-white mb-1">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TWO-SIDED VALUE PROP */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Built for both sides of the table
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Whether you&apos;re proving your skills or sourcing your next engineer,
            Agon is built for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Student card */}
          <div className="relative rounded-2xl p-8 bg-gray-900 border border-gray-800 overflow-hidden card-hover group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="inline-flex p-3 rounded-xl bg-violet-600/10 border border-violet-600/20 mb-5">
                <Code2 size={24} className="text-violet-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">For Students</h3>
              <p className="text-gray-400 mb-6">
                Ditch the endless applications. Build real projects, form elite
                teams, and let your work speak for itself.
              </p>
              <ul className="space-y-3">
                {[
                  "Access challenges from top tech companies",
                  "Form cross-disciplinary teams",
                  "Build a portfolio of shipped, real-world work",
                  "Earn XP and climb from Bronze to Elite rank",
                  "Direct path from competition to job offer",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckCircle size={16} className="text-violet-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-violet-400 hover:text-violet-300 group/link">
                Join as a Student <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Company card */}
          <div className="relative rounded-2xl p-8 bg-gray-900 border border-gray-800 overflow-hidden card-hover group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="inline-flex p-3 rounded-xl bg-cyan-600/10 border border-cyan-600/20 mb-5">
                <Building2 size={24} className="text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">For Companies</h3>
              <p className="text-gray-400 mb-6">
                Evaluate candidates on real output, not interview performance.
                Source talent that can actually ship.
              </p>
              <ul className="space-y-3">
                {[
                  "Post hackathons tied to real business problems",
                  "Assess candidates on actual built work",
                  "Browse a ranked talent discovery feed",
                  "Filter by skill, rank, or university",
                  "Offer prizes, internships, or full-time roles",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckCircle size={16} className="text-cyan-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 group/link">
                Post a Challenge <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-gray-900/50 border-y border-gray-800 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              From challenge to career in 3 steps
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-violet-600/40 via-cyan-600/40 to-violet-600/40" />

            {[
              {
                step: "01",
                icon: <Building2 size={22} className="text-violet-400" />,
                title: "Company posts a challenge",
                desc: "A tech company creates a hackathon around a real business problem — with a brief, prizes, and a deadline.",
                accent: "border-violet-700/40",
              },
              {
                step: "02",
                icon: <Users size={22} className="text-cyan-400" />,
                title: "Students form teams & build",
                desc: "Students browse competitions, form teams, and spend 1–4 weeks building a real solution.",
                accent: "border-cyan-700/40",
              },
              {
                step: "03",
                icon: <Trophy size={22} className="text-yellow-400" />,
                title: "Best team gets hired",
                desc: "The company reviews submissions, picks a winner, and extends prizes, internships, or full-time offers.",
                accent: "border-yellow-700/40",
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`relative p-8 rounded-2xl bg-gray-900 border ${item.accent} card-hover`}
              >
                <div className="text-6xl font-black text-gray-800/70 mb-4 select-none leading-none">
                  {item.step}
                </div>
                <div className="inline-flex p-2.5 rounded-xl bg-gray-800 mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RANK SYSTEM */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Earn your rank. Build your reputation.
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Every competition you enter earns XP. Your public rank tells
            companies exactly where you stand — no guesswork, no fluff.
          </p>
        </div>

        <div className="relative">
          {/* Progress track */}
          <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500/30 via-yellow-500/30 via-cyan-500/30 to-violet-500/50 -translate-y-1/2 mx-16" />

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative">
            {RANKS.map((rank, i) => (
              <div
                key={rank.label}
                className={`flex flex-col items-center p-5 rounded-2xl border ${rank.bg} ${rank.border} card-hover ${i === 4 ? "ring-1 ring-violet-500/30" : ""}`}
              >
                <span className="text-3xl mb-3">{rank.icon}</span>
                <span className={`font-bold text-sm mb-1 ${rank.color}`}>{rank.label}</span>
                <span className="text-xs text-gray-600">{rank.xp}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 text-sm text-gray-500">
          <ChevronRight size={14} className="text-violet-500" />
          Rank up by winning competitions and placing in the top teams
        </div>
      </section>

      {/* FEATURED COMPETITIONS */}
      <section id="competitions" className="bg-gray-900/50 border-y border-gray-800 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Active Competitions</h2>
              <p className="text-gray-400">Teams are forming right now.</p>
            </div>
            <Link
              href="/auth"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mockCompetitions.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="group flex flex-col rounded-2xl bg-gray-900 border border-gray-800 hover:border-violet-600/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-900/20 overflow-hidden"
              >
                {/* Color accent top bar */}
                <div className="h-1 w-full bg-gradient-to-r from-violet-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-violet-400 mb-1.5 uppercase tracking-wide">
                        {c.host_company.company_name}
                      </div>
                      <h3 className="font-semibold text-white leading-snug">{c.title}</h3>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                      Active
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 line-clamp-2 mb-5 flex-1 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-1.5">
                      <Trophy size={12} className="text-yellow-500" />
                      <span className="truncate max-w-[140px]">{c.prize_description?.split("+")[0]?.trim() || "—"}</span>
                    </div>
                    <div className="shrink-0 text-gray-600">
                      {formatDeadline(c.deadline)}
                    </div>
                  </div>

                  <Link
                    href="/auth"
                    className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-gray-800 hover:bg-violet-600 text-gray-300 hover:text-white border border-gray-700 hover:border-violet-600 transition-all"
                  >
                    View Challenge <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/70 via-gray-900 to-cyan-900/30 border border-violet-700/30 p-12 sm:p-16 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="animate-blob absolute -top-20 -left-20 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl" />
            <div className="animate-blob animation-delay-4000 absolute -bottom-10 right-0 w-72 h-72 bg-cyan-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <div className="flex justify-center mb-6">
              <AgonLogo size={52} />
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
              Ready to compete?
            </h2>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto text-lg">
              Join the platform where talent is measured by what you build —
              not what you say in an interview.
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-white text-gray-950 hover:bg-gray-100 transition-all shadow-xl hover:-translate-y-0.5"
            >
              Create your account <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
