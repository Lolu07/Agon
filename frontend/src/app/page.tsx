"use client";

import Link from "next/link";
import { ArrowRight, Trophy, Users, Building2, CheckCircle, Zap, Code2, Star } from "lucide-react";
import { mockCompetitions } from "@/lib/mockData";

function formatDeadline(iso: string) {
  const diff = Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? `${diff} days left` : "Closed";
}

export default function LandingPage() {
  return (
    <div className="flex flex-col">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl" />
          <div className="absolute -top-20 right-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-400 text-sm mb-8">
            <Zap size={14} />
            The competitive hiring platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
            Win Competitions.<br />
            <span className="gradient-text">Get Hired.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-400 mb-10">
            Agon connects ambitious students with leading tech companies through
            real-world hackathons. Build something great. Land your dream job.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-all shadow-lg shadow-violet-900/40"
            >
              Start Competing <ArrowRight size={18} />
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition-all"
            >
              <Building2 size={18} /> Post a Challenge
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <section className="border-y border-gray-800 bg-gray-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: "1,200+", label: "Students competing" },
              { value: "80+", label: "Companies hiring" },
              { value: "340+", label: "Competitions hosted" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-black text-white mb-1">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TWO-SIDED VALUE PROP ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Built for both sides of the table
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Whether you&apos;re looking to prove your skills or find your next
            senior engineer, Agon has you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Student card */}
          <div className="relative rounded-2xl p-8 bg-gray-900 border border-gray-800 overflow-hidden group hover:border-violet-700/50 transition-colors">
            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/5 rounded-full blur-2xl" />
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
                  "Form cross-disciplinary teams (eng + design + PM)",
                  "Build a portfolio of shipped, real-world work",
                  "Direct path from competition to job offer",
                  "Win prizes, recognition, and career opportunities",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckCircle size={16} className="text-violet-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-violet-400 hover:text-violet-300">
                Join as a Student <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Company card */}
          <div className="relative rounded-2xl p-8 bg-gray-900 border border-gray-800 overflow-hidden group hover:border-cyan-700/50 transition-colors">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-600/5 rounded-full blur-2xl" />
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
                  "Dramatically reduce time-to-hire",
                  "Access a pool of motivated, competitive talent",
                  "Offer prizes, internships, or full-time roles",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckCircle size={16} className="text-cyan-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300">
                Post a Challenge <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-gray-900/40 border-y border-gray-800 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              From challenge to career in 3 steps
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Building2 size={22} className="text-violet-400" />,
                title: "Company posts a challenge",
                desc: "A tech company creates a hackathon around a real business problem — with a clear brief, dataset or API access, and a prize.",
              },
              {
                step: "02",
                icon: <Users size={22} className="text-cyan-400" />,
                title: "Students form teams & build",
                desc: "Students browse active competitions, form diverse teams, and spend 1–4 weeks building a real solution. The best ideas win.",
              },
              {
                step: "03",
                icon: <Trophy size={22} className="text-yellow-400" />,
                title: "Best team gets hired",
                desc: "The company reviews all submissions, picks a winner, and extends prize money, internships, or direct full-time job offers.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="text-5xl font-black text-gray-800 mb-4 select-none">
                  {item.step}
                </div>
                <div className="inline-flex p-2 rounded-lg bg-gray-800 mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED COMPETITIONS ─────────────────────────────────────────── */}
      <section id="competitions" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Active Competitions</h2>
            <p className="text-gray-400">Jump in — teams are forming now.</p>
          </div>
          <Link
            href="/student"
            className="hidden sm:inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockCompetitions.slice(0, 3).map((c) => (
            <div
              key={c.id}
              className="group flex flex-col rounded-2xl bg-gray-900 border border-gray-800 hover:border-violet-700/50 transition-all p-6"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1">
                  <div className="text-xs font-medium text-violet-400 mb-1">
                    {c.host_company.company_name}
                  </div>
                  <h3 className="font-semibold text-white leading-snug">{c.title}</h3>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                  Active
                </span>
              </div>

              <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">
                {c.description}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-800">
                <div className="flex items-center gap-1">
                  <Trophy size={12} className="text-yellow-500" />
                  {c.prize_description?.split("+")[0]?.trim() || "—"}
                </div>
                <div className="flex items-center gap-1">
                  <Star size={12} />
                  {formatDeadline(c.deadline)}
                </div>
              </div>

              <Link
                href="/auth"
                className="mt-4 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-gray-800 hover:bg-violet-600 text-gray-300 hover:text-white border border-gray-700 hover:border-violet-600 transition-all"
              >
                View Challenge <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/60 via-gray-900 to-cyan-900/30 border border-violet-700/30 p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-cyan-600/10 pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to compete?
            </h2>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto">
              Join thousands of students already building their careers through
              competition. Sign up free in 60 seconds.
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-white text-gray-950 hover:bg-gray-100 transition-all shadow-xl"
            >
              Create your account <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
