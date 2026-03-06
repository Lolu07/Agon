"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trophy, Clock, Users, ExternalLink, CheckCircle, Plus, LogIn } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { mockCompetitions, mockTeams } from "@/lib/mockData";
import { Competition, Team } from "@/types";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

function Countdown({ deadline }: { deadline: string }) {
  const diff = Math.max(0, new Date(deadline).getTime() - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return (
    <div className="flex gap-3">
      {[{ v: days, l: "Days" }, { v: hours, l: "Hours" }].map(({ v, l }) => (
        <div key={l} className="text-center px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 min-w-[64px]">
          <div className="text-2xl font-black text-white">{v}</div>
          <div className="text-xs text-gray-500">{l}</div>
        </div>
      ))}
    </div>
  );
}

export default function CompetitionDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [fetching, setFetching] = useState(true);
  const [myTeam, setMyTeam] = useState<Team | null>(null);

  // Modals
  const [formTeamOpen, setFormTeamOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  // Form team state
  const [teamName, setTeamName] = useState("");
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState("");
  const [teamSuccess, setTeamSuccess] = useState(false);

  // Submit project state
  const [projectUrl, setProjectUrl] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth");
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, teamsRes] = await Promise.all([
          api.get(`/competitions/${id}/`),
          api.get(`/teams/?competition_id=${id}`),
        ]);
        setCompetition(compRes.data);
        const teamList: Team[] = teamsRes.data.results || teamsRes.data;
        setTeams(teamList);
        if (user) {
          const mine = teamList.find((t) =>
            t.memberships?.some((m) => m.user.id === user.id)
          );
          setMyTeam(mine || null);
        }
      } catch {
        const comp = mockCompetitions.find((c) => c.id === parseInt(id));
        setCompetition(comp || null);
        setTeams(mockTeams.filter((t) => (t.competition as Competition).id === parseInt(id)));
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchData();
  }, [id, user]);

  const handleFormTeam = async (e: FormEvent) => {
    e.preventDefault();
    setTeamError("");
    setTeamLoading(true);
    try {
      const { data } = await api.post("/teams/", {
        name: teamName,
        competition_id: parseInt(id),
      });
      setMyTeam(data);
      setTeamSuccess(true);
      setTimeout(() => { setFormTeamOpen(false); setTeamSuccess(false); }, 1500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { name?: string[] } } })?.response?.data?.name?.[0];
      setTeamError(msg || "Failed to create team. That name may already be taken.");
    } finally {
      setTeamLoading(false);
    }
  };

  const handleJoinTeam = async (teamId: number) => {
    try {
      await api.post(`/teams/${teamId}/join/`);
      const joined = teams.find((t) => t.id === teamId);
      setMyTeam(joined || null);
    } catch {
      alert("Could not join team. You may already be on a team for this competition.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitLoading(true);
    try {
      await api.post("/submissions/", {
        team_id: myTeam!.id,
        competition_id: parseInt(id),
        file_url: projectUrl,
        description: projectDesc,
      });
      setSubmitSuccess(true);
      setTimeout(() => { setSubmitOpen(false); setSubmitSuccess(false); }, 1500);
    } catch {
      setSubmitError("Submission failed. Make sure the URL is valid and you haven't already submitted.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all";

  if (fetching) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 animate-pulse space-y-4">
        <div className="h-8 w-48 bg-gray-800 rounded" />
        <div className="h-6 w-3/4 bg-gray-800 rounded" />
        <div className="h-4 w-full bg-gray-800 rounded" />
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-gray-500">
        Competition not found.
        <Link href="/student" className="block mt-4 text-violet-400 hover:text-violet-300">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link href="/student" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to competitions
      </Link>

      {/* Hero */}
      <div className="rounded-2xl bg-gray-900 border border-gray-800 p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex-1">
            <span className="text-sm font-medium text-violet-400 mb-2 block">
              {competition.host_company.company_name}
            </span>
            <h1 className="text-3xl font-bold text-white mb-3">{competition.title}</h1>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                Active
              </span>
              <span className="text-xs text-gray-500">
                Posted {new Date(competition.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <Countdown deadline={competition.deadline} />
        </div>

        {/* Prize */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-900/10 border border-yellow-700/20 mb-6">
          <Trophy size={18} className="text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-medium text-yellow-400 mb-0.5">Prize</div>
            <div className="text-sm text-gray-200">{competition.prize_description}</div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Challenge Brief</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">{competition.description}</p>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-800">
          <Clock size={14} />
          Deadline: {new Date(competition.deadline).toLocaleDateString("en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
        </div>
      </div>

      {/* My Team Status */}
      {myTeam ? (
        <div className="rounded-2xl bg-green-900/10 border border-green-700/30 p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-400" />
              <div>
                <div className="font-semibold text-white">You&apos;re on Team: {myTeam.name}</div>
                <div className="text-sm text-gray-400">
                  {myTeam.member_count || myTeam.memberships?.length || 1} member(s)
                </div>
              </div>
            </div>
            <Button onClick={() => setSubmitOpen(true)} variant="accent" size="md">
              Submit Project
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-violet-900/10 border border-violet-700/30 p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="font-semibold text-white mb-1">Ready to compete?</div>
              <div className="text-sm text-gray-400">Form a new team or join an existing one below.</div>
            </div>
            <Button onClick={() => setFormTeamOpen(true)} size="md">
              <Plus size={16} /> Form a Team
            </Button>
          </div>
        </div>
      )}

      {/* Teams section */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <Users size={18} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Teams ({teams.length})</h2>
        </div>

        {teams.length === 0 ? (
          <div className="text-center py-12 text-gray-500 rounded-2xl bg-gray-900 border border-gray-800 border-dashed">
            <Users size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No teams yet — be the first to form one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {teams.map((team) => {
              const isMine = team.id === myTeam?.id;
              return (
                <div
                  key={team.id}
                  className={`rounded-xl border p-5 flex items-center justify-between gap-4 ${
                    isMine ? "bg-violet-900/10 border-violet-700/30" : "bg-gray-900 border-gray-800"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{team.name}</span>
                      {isMine && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-violet-600/20 text-violet-400 border border-violet-600/30">
                          Your team
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {team.member_count || team.memberships?.length || 1} member(s)
                      {team.memberships && (
                        <span className="ml-2 text-gray-600">
                          · {team.memberships.map((m) => m.user.first_name).join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                  {!myTeam && (
                    <Button variant="secondary" size="sm" onClick={() => handleJoinTeam(team.id)}>
                      <LogIn size={14} /> Join
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FORM TEAM MODAL ── */}
      <Modal isOpen={formTeamOpen} onClose={() => setFormTeamOpen(false)} title="Form a Team">
        {teamSuccess ? (
          <div className="text-center py-6">
            <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
            <p className="text-white font-semibold">Team created!</p>
            <p className="text-gray-400 text-sm mt-1">You&apos;re now the captain of {teamName}.</p>
          </div>
        ) : (
          <form onSubmit={handleFormTeam} className="space-y-4">
            <p className="text-sm text-gray-400">
              Give your team a memorable name. You&apos;ll be set as the captain automatically.
            </p>
            {teamError && (
              <div className="p-3 rounded-lg bg-red-900/20 border border-red-700/40 text-red-400 text-sm">
                {teamError}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Team name</label>
              <input
                type="text"
                required
                maxLength={100}
                placeholder="e.g. Neural Squad"
                className={inputClass}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setFormTeamOpen(false)} type="button">
                Cancel
              </Button>
              <Button loading={teamLoading} className="flex-1" type="submit">
                Create Team
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── SUBMIT PROJECT MODAL ── */}
      <Modal isOpen={submitOpen} onClose={() => setSubmitOpen(false)} title="Submit Your Project">
        {submitSuccess ? (
          <div className="text-center py-6">
            <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
            <p className="text-white font-semibold">Submission received!</p>
            <p className="text-gray-400 text-sm mt-1">Good luck! The company will review all submissions after the deadline.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-400">
              Submit a link to your project — a GitHub repo, deployed app URL, or Google Drive link.
            </p>
            {submitError && (
              <div className="p-3 rounded-lg bg-red-900/20 border border-red-700/40 text-red-400 text-sm">
                {submitError}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Project URL <ExternalLink size={11} className="inline ml-1" />
              </label>
              <input
                type="url"
                required
                placeholder="https://github.com/yourteam/project"
                className={inputClass}
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Description (optional)
              </label>
              <textarea
                rows={4}
                placeholder="Briefly describe your solution, tech stack, and key features..."
                className={`${inputClass} resize-none`}
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setSubmitOpen(false)} type="button">
                Cancel
              </Button>
              <Button loading={submitLoading} variant="accent" className="flex-1" type="submit">
                Submit Project
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
