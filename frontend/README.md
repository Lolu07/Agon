# Agon Frontend

> Next.js 14 (App Router) frontend for the Agon competitive hiring platform.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| HTTP Client | Axios |
| Icons | Lucide React |
| Auth | JWT (stored in localStorage, managed via Context) |

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                         # Next.js App Router pages
│   │   ├── layout.tsx               # Root layout (AuthProvider + Navbar + Footer)
│   │   ├── globals.css              # Tailwind directives + custom styles
│   │   ├── page.tsx                 # Landing page (/)
│   │   ├── auth/
│   │   │   └── page.tsx             # Login + Register (/auth)
│   │   ├── student/
│   │   │   ├── page.tsx             # Student dashboard (/student)
│   │   │   └── competitions/
│   │   │       └── [id]/
│   │   │           └── page.tsx     # Competition detail + Form Team + Submit
│   │   └── company/
│   │       ├── page.tsx             # Company dashboard (/company)
│   │       └── competitions/
│   │           ├── new/
│   │           │   └── page.tsx     # Create competition form
│   │           └── [id]/
│   │               └── submissions/
│   │                   └── page.tsx # View + evaluate submissions
│   │
│   ├── components/
│   │   ├── Navbar.tsx               # Role-aware responsive navbar
│   │   ├── Footer.tsx               # Site footer
│   │   └── ui/
│   │       ├── Button.tsx           # Variant-aware button component
│   │       └── Modal.tsx            # Reusable overlay modal
│   │
│   ├── lib/
│   │   ├── api.ts                   # Axios instance + JWT interceptors
│   │   ├── auth.tsx                 # AuthContext + useAuth hook
│   │   └── mockData.ts              # Fallback data when API is unavailable
│   │
│   └── types/
│       └── index.ts                 # TypeScript interfaces (User, Competition, etc.)
│
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── .env.local.example
```

---

## Page Map

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page — hero, value prop, competitions | No |
| `/auth` | Login + Register with role selection | No |
| `/student` | Competition feed + search | Student |
| `/student/competitions/:id` | Full competition detail + Form Team + Submit | Student |
| `/company` | Company dashboard + competition list | Company |
| `/company/competitions/new` | Create a new competition | Company |
| `/company/competitions/:id/submissions` | Review and evaluate submissions | Company |

---

## API Integration

All API calls go through `src/lib/api.ts` — an Axios instance that:
- Reads `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000/api/v1`)
- Attaches `Authorization: Bearer <token>` from `localStorage` on every request
- On a **401 response**, automatically attempts a token refresh via `/auth/token/refresh/`
- If refresh fails, clears auth state and redirects to `/auth`

### Fallback Strategy

If the Django backend is not reachable, every page gracefully falls back to mock data from `src/lib/mockData.ts`. A **"Demo mode"** badge appears in the UI. This means the entire frontend is demonstrable without the backend running.

---

## Auth Flow

```
Register → POST /api/v1/auth/register/
         → Auto-login → Store tokens in localStorage
         → Redirect: student → /student | company → /company

Login    → POST /api/v1/auth/login/
         → { access, refresh, user } stored in localStorage
         → Redirect by role

Logout   → Clear localStorage → Redirect to /

Protected pages check useAuth().user on mount;
redirect to /auth if null.
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- (Optional) Agon Django backend running on port 8000

### Setup

```bash
# 1. Navigate to frontend directory
cd Agon/frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.local.example .env.local

# 4. Start the dev server
npm run dev
```

Open **http://localhost:3000**

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Django backend API base URL | `http://localhost:8000/api/v1` |

---

## Design System

- **Background**: `gray-950` (`#030712`)
- **Surface**: `gray-900`
- **Card**: `gray-800`
- **Primary**: `violet-600` — buttons, links, highlights
- **Accent**: `cyan-400` — secondary actions, success states
- **Font**: Inter (via `next/font/google`)

---

## Component Conventions

- All components using React hooks or browser APIs have the `"use client"` directive.
- The root `layout.tsx` is a server component that wraps children with `AuthProvider` (client).
- `Button` accepts `variant` (`primary` | `secondary` | `ghost` | `danger` | `accent`) and `size` (`sm` | `md` | `lg`) and a `loading` boolean.
- `Modal` accepts `isOpen`, `onClose`, `title`, and `children`. It traps scroll and listens for `Escape`.
