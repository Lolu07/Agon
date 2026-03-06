"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import Button from "@/components/ui/Button";

export default function NewCompetitionPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [prize, setPrize] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth");
    if (!isLoading && user && user.role !== "company") router.push("/student");
  }, [user, isLoading, router]);

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/competitions/", {
        title,
        description,
        deadline: new Date(deadline).toISOString(),
        prize_description: prize,
        is_active: true,
      });
      setSuccess(true);
      setTimeout(() => router.push("/company"), 2000);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      if (data) {
        const messages = Object.values(data).flat().join(" ");
        setError(messages || "Failed to create competition.");
      } else {
        setError("Could not connect to the API. Make sure your backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all";

  if (isLoading || !user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      {/* Back */}
      <Link
        href="/company"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Post a Competition</h1>
        <p className="text-gray-400">
          Create a hackathon around a real challenge your company is working on.
        </p>
      </div>

      {success ? (
        <div className="rounded-2xl bg-green-900/20 border border-green-700/30 p-10 text-center">
          <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Competition posted!</h2>
          <p className="text-gray-400">
            Your challenge is now live. Students can discover and form teams.
            Redirecting you to the dashboard...
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-gray-900 border border-gray-800 p-8">
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-900/20 border border-red-700/40 text-red-400 text-sm mb-6">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Competition Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={255}
                placeholder="e.g. AI-Powered Healthcare Dashboard"
                className={inputClass}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <p className="text-xs text-gray-600 mt-1">Keep it clear and specific to the challenge.</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Challenge Brief <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={8}
                placeholder="Describe the problem you want teams to solve. Include:
- The business context
- What a winning solution should do
- Any datasets, APIs, or resources you'll provide
- Evaluation criteria"
                className={`${inputClass} resize-y leading-relaxed`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Submission Deadline <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                required
                min={minDate}
                className={inputClass}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
              <p className="text-xs text-gray-600 mt-1">
                We recommend at least 2 weeks for teams to build something meaningful.
              </p>
            </div>

            {/* Prize */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Prize Description <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. $5,000 cash + fast-track interview with the engineering team"
                className={inputClass}
                value={prize}
                onChange={(e) => setPrize(e.target.value)}
              />
              <p className="text-xs text-gray-600 mt-1">
                Be specific — better prizes attract better talent.
              </p>
            </div>

            {/* Preview */}
            {(title || prize) && (
              <div className="rounded-xl bg-gray-800/50 border border-gray-700 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Preview</p>
                <div className="font-semibold text-white mb-1">{title || "Untitled Competition"}</div>
                <div className="text-sm text-violet-400">{user.company_name}</div>
                {prize && (
                  <div className="text-sm text-yellow-400 mt-2">🏆 {prize}</div>
                )}
                {deadline && (
                  <div className="text-xs text-gray-500 mt-1">
                    Deadline: {new Date(deadline).toLocaleDateString("en-US", {
                      weekday: "long", year: "numeric", month: "long", day: "numeric",
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => router.push("/company")}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading} className="flex-1" size="lg">
                Post Competition →
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
