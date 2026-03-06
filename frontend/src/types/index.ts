export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: "student" | "company";
  company_name?: string;
  is_active?: boolean;
  date_joined?: string;
}

export interface Competition {
  id: number;
  title: string;
  description: string;
  host_company: User;
  deadline: string;
  prize_description: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TeamMember {
  id: number;
  user: User;
  is_captain: boolean;
  joined_at: string;
}

export interface Team {
  id: number;
  name: string;
  competition: Competition | number;
  memberships?: TeamMember[];
  member_count?: number;
  created_at: string;
}

export interface Submission {
  id: number;
  team: Team;
  competition: Competition;
  file_url: string;
  description: string;
  submitted_at: string;
  updated_at?: string;
}

export type Rank = "bronze" | "silver" | "gold" | "platinum" | "elite";

export interface StudentProfile {
  id: number;
  user: User;
  bio: string;
  university: string;
  graduation_year: number | null;
  skills: string;
  skills_list: string[];
  github_url: string;
  linkedin_url: string;
  portfolio_url: string;
  resume_url: string;
  transcript_url: string;
  rank: Rank;
  xp: number;
  updated_at: string;
}

export interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
  role: "student" | "company";
  company_name?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}
