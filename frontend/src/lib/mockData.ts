import { Competition, Team, Submission, StudentProfile } from "@/types";

export const mockCompanies = [
  {
    id: 10,
    email: "team@meditech.io",
    username: "meditech",
    first_name: "MediTech",
    last_name: "Solutions",
    role: "company" as const,
    company_name: "MediTech Solutions",
  },
  {
    id: 11,
    email: "hi@payguard.com",
    username: "payguard",
    first_name: "PayGuard",
    last_name: "Inc",
    role: "company" as const,
    company_name: "PayGuard Inc",
  },
  {
    id: 12,
    email: "build@ecoventures.io",
    username: "ecoventures",
    first_name: "EcoVentures",
    last_name: "Labs",
    role: "company" as const,
    company_name: "EcoVentures Labs",
  },
  {
    id: 13,
    email: "dev@skillbridge.co",
    username: "skillbridge",
    first_name: "SkillBridge",
    last_name: "",
    role: "company" as const,
    company_name: "SkillBridge",
  },
  {
    id: 14,
    email: "tech@logicore.com",
    username: "logicore",
    first_name: "LogiCore",
    last_name: "Systems",
    role: "company" as const,
    company_name: "LogiCore Systems",
  },
];

export const mockCompetitions: Competition[] = [
  {
    id: 1,
    title: "AI-Powered Healthcare Dashboard",
    description:
      "Build a dashboard that uses ML to predict patient outcomes and optimize hospital workflows. Your solution should ingest structured patient data (simulated dataset provided) and surface meaningful insights in an accessible UI. Bonus points for real-time alerting, explainability features, and mobile responsiveness.",
    host_company: mockCompanies[0],
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    prize_description: "$5,000 cash prize + fast-track interview with MediTech engineering team",
    is_active: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    title: "FinTech Fraud Detection Engine",
    description:
      "Design and implement a real-time fraud detection system for payment transactions. You'll receive a labelled dataset of 500k transactions. Build a model that maximises precision-recall on fraudulent patterns, then expose it via a REST API. The winning team ships a production-ready microservice.",
    host_company: mockCompanies[1],
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    prize_description: "$3,000 + potential internship offer at PayGuard",
    is_active: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    title: "Sustainability Carbon Tracker",
    description:
      "Create a web app that helps individuals and small businesses track, visualise, and reduce their carbon footprint. Integrate with at least one third-party data source (energy, transport, food). The product should be beautiful, intuitive, and actionable.",
    host_company: mockCompanies[2],
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    prize_description: "$4,000 + EcoVentures seed partnership opportunity",
    is_active: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    title: "Adaptive EdTech Learning Platform",
    description:
      "Build a personalised learning platform that adapts content difficulty based on student performance. Include a course creation interface for instructors, a learner dashboard with progress tracking, and a recommendation engine that suggests next steps.",
    host_company: mockCompanies[3],
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    prize_description: "$2,500 + full-time junior engineer role offer",
    is_active: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    title: "Supply Chain Visibility Platform",
    description:
      "Build a real-time supply chain tracking platform that aggregates shipment data from multiple carriers, visualises the logistics network on an interactive map, and surfaces delay predictions using historical patterns.",
    host_company: mockCompanies[4],
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    prize_description: "$6,000 + LogiCore Series A interview track",
    is_active: true,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockStudents = [
  { id: 1, email: "ama@dev.io", username: "ama", first_name: "Ama", last_name: "Owusu", role: "student" as const },
  { id: 2, email: "kofi@dev.io", username: "kofi", first_name: "Kofi", last_name: "Mensah", role: "student" as const },
  { id: 3, email: "zara@dev.io", username: "zara", first_name: "Zara", last_name: "Ahmed", role: "student" as const },
  { id: 4, email: "dev@dev.io", username: "dev", first_name: "Dev", last_name: "Patel", role: "student" as const },
];

export const mockTeams: Team[] = [
  {
    id: 1,
    name: "Neural Squad",
    competition: mockCompetitions[0],
    memberships: [
      { id: 1, user: mockStudents[0], is_captain: true, joined_at: new Date().toISOString() },
      { id: 2, user: mockStudents[1], is_captain: false, joined_at: new Date().toISOString() },
      { id: 3, user: mockStudents[2], is_captain: false, joined_at: new Date().toISOString() },
    ],
    member_count: 3,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: "DataStorm",
    competition: mockCompetitions[0],
    memberships: [
      { id: 4, user: mockStudents[3], is_captain: true, joined_at: new Date().toISOString() },
    ],
    member_count: 1,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockSubmissions: Submission[] = [
  {
    id: 1,
    team: mockTeams[0],
    competition: mockCompetitions[0],
    file_url: "https://github.com/neural-squad/healthcare-ai",
    description:
      "A React + FastAPI dashboard with a XGBoost model trained on the MIMIC-III dataset. Features include real-time ICU risk scoring, explainability with SHAP values, and a nurse-friendly alert system.",
    submitted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    team: mockTeams[1],
    competition: mockCompetitions[0],
    file_url: "https://github.com/datastorm/medi-ai",
    description:
      "Full-stack Next.js + Django solution with a custom LSTM model for patient deterioration prediction. Includes mobile app and real-time WebSocket updates.",
    submitted_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockProfiles: StudentProfile[] = [
  {
    id: 1,
    user: mockStudents[0],
    bio: "Full-stack developer passionate about AI and healthcare tech. I love building products that solve real problems and competing in hackathons to sharpen my skills.",
    university: "University of Ghana",
    graduation_year: 2025,
    skills: "Python,React,Machine Learning,FastAPI,PostgreSQL",
    skills_list: ["Python", "React", "Machine Learning", "FastAPI", "PostgreSQL"],
    github_url: "https://github.com/ama-owusu",
    linkedin_url: "https://linkedin.com/in/ama-owusu",
    portfolio_url: "https://ama.dev",
    resume_url: "",
    transcript_url: "",
    rank: "gold",
    xp: 720,
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    user: mockStudents[1],
    bio: "Backend engineer with a strong background in distributed systems and cloud infrastructure. Interested in fintech and supply chain automation.",
    university: "KNUST",
    graduation_year: 2024,
    skills: "Go,Kubernetes,Docker,PostgreSQL,Redis",
    skills_list: ["Go", "Kubernetes", "Docker", "PostgreSQL", "Redis"],
    github_url: "https://github.com/kofi-mensah",
    linkedin_url: "https://linkedin.com/in/kofi-mensah",
    portfolio_url: "",
    resume_url: "",
    transcript_url: "",
    rank: "silver",
    xp: 310,
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    user: mockStudents[2],
    bio: "UI/UX designer turned frontend developer. I care deeply about accessibility, design systems, and making complex interfaces feel intuitive.",
    university: "University of Cape Coast",
    graduation_year: 2025,
    skills: "TypeScript,Next.js,Figma,Tailwind CSS,React",
    skills_list: ["TypeScript", "Next.js", "Figma", "Tailwind CSS", "React"],
    github_url: "https://github.com/zara-ahmed",
    linkedin_url: "",
    portfolio_url: "https://zara.design",
    resume_url: "",
    transcript_url: "",
    rank: "platinum",
    xp: 1150,
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    user: mockStudents[3],
    bio: "Data scientist focused on NLP and computer vision. Three-time hackathon finalist, open source contributor, and ML research assistant.",
    university: "University of Lagos",
    graduation_year: 2026,
    skills: "Python,PyTorch,NLP,Computer Vision,AWS",
    skills_list: ["Python", "PyTorch", "NLP", "Computer Vision", "AWS"],
    github_url: "https://github.com/dev-patel",
    linkedin_url: "https://linkedin.com/in/dev-patel",
    portfolio_url: "",
    resume_url: "",
    transcript_url: "",
    rank: "bronze",
    xp: 85,
    updated_at: new Date().toISOString(),
  },
];
