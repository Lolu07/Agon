"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import Button from "@/components/ui/Button";

interface ProfileForm {
  bio: string;
  university: string;
  graduation_year: string;
  skills: string;
  github_url: string;
  linkedin_url: string;
  portfolio_url: string;
  resume_url: string;
  transcript_url: string;
}

const EMPTY: ProfileForm = {
  bio: "",
  university: "",
  graduation_year: "",
  skills: "",
  github_url: "",
  linkedin_url: "",
  portfolio_url: "",
  resume_url: "",
  transcript_url: "",
};

export default function EditProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<ProfileForm>(EMPTY);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth");
    if (!isLoading && user && user.role !== "student") router.push("/company");
  }, [user, isLoading, router]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/profiles/me/");
        setProfileId(data.id);
        setForm({
          bio: data.bio || "",
          university: data.university || "",
          graduation_year: data.graduation_year ? String(data.graduation_year) : "",
          skills: data.skills || "",
          github_url: data.github_url || "",
          linkedin_url: data.linkedin_url || "",
          portfolio_url: data.portfolio_url || "",
          resume_url: data.resume_url || "",
          transcript_url: data.transcript_url || "",
        });
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status !== 404) {
          setError("Could not load your profile. Please try again.");
        }
        // 404 = no profile yet, that's fine — form stays empty for creation
      } finally {
        setFetching(false);
      }
    };
    if (user) load();
  }, [user]);

  const set = (field: keyof ProfileForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const payload = {
      ...form,
      graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
    };

    try {
      if (profileId) {
        await api.patch(`/profiles/${profileId}/`, payload);
      } else {
        const { data } = await api.post("/profiles/", payload);
        setProfileId(data.id);
      }
      setSuccess(true);
      setTimeout(() => router.push("/student/profile"), 1000);
    } catch {
      setError("Failed to save profile. Please check your inputs and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/student/profile"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to profile
      </Link>

      <h1 className="text-2xl font-bold text-white mb-1">
        {profileId ? "Edit Profile" : "Create Profile"}
      </h1>
      <p className="text-gray-400 text-sm mb-8">
        This information is visible to companies on the talent discovery page.
      </p>

      {fetching ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-gray-900 border border-gray-800 p-6 animate-pulse">
              <div className="h-4 w-1/4 bg-gray-800 rounded mb-3" />
              <div className="h-10 w-full bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bio */}
          <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-white">About You</h2>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Bio</label>
              <textarea
                value={form.bio}
                onChange={set("bio")}
                rows={4}
                placeholder="Tell companies who you are and what you're passionate about..."
                className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">University</label>
                <input
                  type="text"
                  value={form.university}
                  onChange={set("university")}
                  placeholder="e.g. University of Ghana"
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Graduation Year</label>
                <input
                  type="number"
                  value={form.graduation_year}
                  onChange={set("graduation_year")}
                  placeholder="e.g. 2025"
                  min={2000}
                  max={2035}
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Skills</h2>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Skills <span className="text-gray-600">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={form.skills}
                onChange={set("skills")}
                placeholder="e.g. Python, React, Machine Learning, PostgreSQL"
                className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-violet-500"
              />
              {form.skills && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {form.skills.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-gray-800 text-gray-300 border border-gray-700">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white">Links</h2>

            {[
              { key: "github_url" as const, label: "GitHub URL", placeholder: "https://github.com/yourhandle" },
              { key: "linkedin_url" as const, label: "LinkedIn URL", placeholder: "https://linkedin.com/in/yourhandle" },
              { key: "portfolio_url" as const, label: "Portfolio / Website", placeholder: "https://yoursite.dev" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
                <input
                  type="url"
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
            ))}
          </div>

          {/* Documents */}
          <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Documents</h2>
              <p className="text-xs text-gray-500 mt-1">
                Paste Google Drive or Dropbox share links. Make sure sharing is set to &ldquo;Anyone with the link&rdquo;.
              </p>
            </div>

            {[
              { key: "resume_url" as const, label: "Resume", placeholder: "https://drive.google.com/file/d/..." },
              { key: "transcript_url" as const, label: "Transcript", placeholder: "https://drive.google.com/file/d/..." },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
                <input
                  type="url"
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
            ))}
          </div>

          {/* Feedback */}
          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-700/30 rounded-lg px-4 py-3">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-green-400 bg-green-900/20 border border-green-700/30 rounded-lg px-4 py-3">
              Profile saved! Redirecting…
            </p>
          )}

          <Button type="submit" size="md" loading={saving} className="w-full sm:w-auto">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {profileId ? "Save Changes" : "Create Profile"}
          </Button>
        </form>
      )}
    </div>
  );
}
