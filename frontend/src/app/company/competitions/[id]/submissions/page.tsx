"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ExternalLink, Users, Trophy, Star, Mail, CheckCircle2, Eye,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { mockSubmissions, mockCompetitions } from "@/lib/mockData";
import { Submission, Competition } from "@/types";
import Button from "@/components/ui/Button";

export default function SubmissionsPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [fetching, setFetching] = useState(true);
  const [markedWinner, setMarkedWinner] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth");
    if (!isLoading && user && user.role !== "company") router.push("/student");
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, subRes] = await Promise.all([
          api.get(`/competitions/${id}/`),
          api.get(`/submissions/?competition_id=${id}`),
        ]);
        setCompetition(compRes.data);
        setSubmissions(subRes.data.results || subRes.data);
      } catch {
        const comp = mockCompetitions.find((c) => c.id === parseInt(id));
        setCompetition(comp || mockCompetitions[0]);
        setSubmissions(mockSubmissions);
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (isLoading || !user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link
        href="/company"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      {/* Competition header */}
      {competition && (
        <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6 mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs font-medium text-violet-400 block mb-1">
                {competition.host_company.company_name}
              </span>
              <h1 className="text-2xl font-bold text-white mb-2">{competition.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Trophy size={14} className="text-yellow-500" />
                  {competition.prize_description}
                </div>
                <div>
                  Deadline: {new Date(competition.deadline).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-center px-4 py-2 rounded-lg bg-gray-800 border border-gray-700">
                <div className="text-xl font-bold text-white">{submissions.length}</div>
                <div className="text-xs text-gray-500">Submissions</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submissions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-5">
          Team Submissions ({submissions.length})
        </h2>

        {fetching ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl bg-gray-900 border border-gray-800 p-6 animate-pulse">
                <div className="h-5 w-1/3 bg-gray-800 rounded mb-3" />
                <div className="h-3 w-full bg-gray-800 rounded mb-2" />
                <div className="h-3 w-5/6 bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-gray-900 border border-gray-800 border-dashed">
            <Users size={40} className="mx-auto mb-4 text-gray-700" />
            <p className="text-gray-500 mb-2">No submissions yet.</p>
            <p className="text-sm text-gray-600">Check back after teams have had time to build.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {submissions.map((sub, index) => {
              const isWinner = markedWinner === sub.id;
              return (
                <div
                  key={sub.id}
                  className={`rounded-2xl border p-6 transition-all ${
                    isWinner
                      ? "bg-yellow-900/10 border-yellow-600/40"
                      : "bg-gray-900 border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4">
                      {/* Rank badge */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                          index === 0
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : "bg-gray-800 text-gray-500 border border-gray-700"
                        }`}
                      >
                        {index + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="font-semibold text-white text-lg">{sub.team.name}</h3>
                          {isWinner && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                              <Star size={10} fill="currentColor" /> Winner
                            </span>
                          )}
                        </div>

                        {/* Team members */}
                        <div className="flex items-center gap-1.5 mb-3">
                          <Users size={12} className="text-gray-500" />
                          <span className="text-xs text-gray-500">
                            {sub.team.memberships && sub.team.memberships.length > 0
                              ? sub.team.memberships.map((m) =>
                                  `${m.user.first_name} ${m.user.last_name}${m.is_captain ? " (Captain)" : ""}`
                                ).join(", ")
                              : `${sub.team.member_count || 1} member(s)`}
                          </span>
                        </div>

                        {/* Description */}
                        {sub.description && (
                          <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                            {sub.description}
                          </p>
                        )}

                        {/* Submission URL */}
                        <a
                          href={sub.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          <ExternalLink size={13} />
                          View Submission
                        </a>

                        <span className="mx-3 text-gray-700">·</span>
                        <span className="text-xs text-gray-600">
                          Submitted {new Date(sub.submitted_at).toLocaleDateString("en-US", {
                            year: "numeric", month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <a
                        href={sub.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="secondary" size="sm">
                          <Eye size={14} /> Review
                        </Button>
                      </a>
                      <Button
                        variant={isWinner ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setMarkedWinner(isWinner ? null : sub.id)}
                        className={isWinner ? "border-yellow-700/50 text-yellow-400 hover:bg-yellow-900/20" : ""}
                      >
                        <Trophy size={14} className={isWinner ? "text-yellow-400" : ""} />
                        {isWinner ? "Unmark Winner" : "Mark as Winner"}
                      </Button>
                      <a href={`mailto:${sub.team.memberships?.[0]?.user.email || ""}`}>
                        <Button variant="ghost" size="sm">
                          <Mail size={14} /> Contact Team
                        </Button>
                      </a>
                    </div>
                  </div>

                  {/* Winner banner */}
                  {isWinner && (
                    <div className="mt-4 pt-4 border-t border-yellow-700/20 flex items-center gap-2 text-sm text-yellow-400">
                      <CheckCircle2 size={16} />
                      This team has been selected as the winner. Contact them to arrange the prize and next steps.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
