"""
Populates the database with realistic demo data for presentations.
Run: python manage.py seed
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import User, Competition, Team, TeamMember, Submission, StudentProfile


COMPANY_PASSWORD = "Demo1234!"
STUDENT_PASSWORD = "Demo1234!"


class Command(BaseCommand):
    help = "Seed the database with demo data"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")
        self._clear()
        companies = self._create_companies()
        competitions = self._create_competitions(companies)
        students = self._create_students()
        self._create_profiles(students)
        teams = self._create_teams(competitions, students)
        self._create_submissions(teams, competitions)
        self.stdout.write(self.style.SUCCESS("Done. Login credentials:"))
        self.stdout.write(f"  Company:  techcorp@demo.com  /  {COMPANY_PASSWORD}")
        self.stdout.write(f"  Student:  alex@demo.com      /  {STUDENT_PASSWORD}")

    def _clear(self):
        Submission.objects.all().delete()
        TeamMember.objects.all().delete()
        Team.objects.all().delete()
        StudentProfile.objects.all().delete()
        Competition.objects.all().delete()
        User.objects.filter(email__endswith="@demo.com").delete()

    def _create_companies(self):
        companies = [
            User.objects.create_user(
                username="techcorp",
                email="techcorp@demo.com",
                password=COMPANY_PASSWORD,
                first_name="TechCorp",
                last_name="HQ",
                role="company",
                company_name="TechCorp",
            ),
            User.objects.create_user(
                username="buildhub",
                email="buildhub@demo.com",
                password=COMPANY_PASSWORD,
                first_name="BuildHub",
                last_name="HQ",
                role="company",
                company_name="BuildHub",
            ),
        ]
        self.stdout.write(f"  Created {len(companies)} companies")
        return companies

    def _create_competitions(self, companies):
        now = timezone.now()
        competitions = [
            Competition.objects.create(
                title="AI Productivity Tool Challenge",
                description=(
                    "Build a productivity tool powered by AI that helps developers "
                    "ship faster. Could be a code reviewer, a standup bot, a PR summariser, "
                    "or anything in between. Judges will evaluate on impact, execution, and creativity."
                ),
                host_company=companies[0],
                deadline=now + timedelta(days=12),
                prize_description="$5,000 cash prize + fast-track interview at TechCorp",
                is_active=True,
            ),
            Competition.objects.create(
                title="Fintech Dashboard Hackathon",
                description=(
                    "Design and build a personal finance dashboard that helps users "
                    "visualise their spending, set goals, and get AI-powered insights. "
                    "Focus on clean UI, real-time data, and actionable recommendations."
                ),
                host_company=companies[1],
                deadline=now + timedelta(days=7),
                prize_description="$3,000 + internship offer for the top two teams",
                is_active=True,
            ),
            Competition.objects.create(
                title="Open Source Dev Tool Sprint",
                description=(
                    "Pick any developer pain point and build an open-source tool that solves it. "
                    "CLI tools, VS Code extensions, GitHub Actions — anything goes. "
                    "Must be shipped and publicly available on GitHub by the deadline."
                ),
                host_company=companies[0],
                deadline=now + timedelta(days=20),
                prize_description="$2,000 + feature in TechCorp's engineering blog",
                is_active=True,
            ),
        ]
        self.stdout.write(f"  Created {len(competitions)} competitions")
        return competitions

    def _create_students(self):
        students_data = [
            dict(username="alex_m", email="alex@demo.com", first_name="Alex", last_name="Morgan"),
            dict(username="priya_k", email="priya@demo.com", first_name="Priya", last_name="Kumar"),
            dict(username="jordan_t", email="jordan@demo.com", first_name="Jordan", last_name="Torres"),
            dict(username="sam_l", email="sam@demo.com", first_name="Sam", last_name="Lee"),
            dict(username="nina_w", email="nina@demo.com", first_name="Nina", last_name="Walsh"),
        ]
        students = []
        for data in students_data:
            u = User.objects.create_user(
                **data,
                password=STUDENT_PASSWORD,
                role="student",
            )
            students.append(u)
        self.stdout.write(f"  Created {len(students)} students")
        return students

    def _create_profiles(self, students):
        profiles_data = [
            dict(
                user=students[0],
                bio="Full-stack engineer passionate about developer tooling and AI. I love shipping things fast and learning in public.",
                university="University of Toronto",
                graduation_year=2026,
                skills="Python,React,Django,TypeScript,Docker",
                github_url="https://github.com",
                linkedin_url="https://linkedin.com",
                xp=850,
            ),
            dict(
                user=students[1],
                bio="Machine learning engineer focused on NLP and applied AI. Previously interned at two YC startups.",
                university="University of Waterloo",
                graduation_year=2025,
                skills="Python,Machine Learning,TensorFlow,FastAPI,SQL",
                github_url="https://github.com",
                linkedin_url="https://linkedin.com",
                xp=2100,
            ),
            dict(
                user=students[2],
                bio="Frontend-focused engineer who cares deeply about design and user experience.",
                university="NYU",
                graduation_year=2026,
                skills="React,TypeScript,Figma,Next.js,CSS",
                github_url="https://github.com",
                linkedin_url="https://linkedin.com",
                xp=320,
            ),
            dict(
                user=students[3],
                bio="Backend and infrastructure engineer. Big fan of clean APIs and well-designed systems.",
                university="Georgia Tech",
                graduation_year=2025,
                skills="Go,Python,Kubernetes,PostgreSQL,AWS",
                github_url="https://github.com",
                linkedin_url="https://linkedin.com",
                xp=1200,
            ),
            dict(
                user=students[4],
                bio="Generalist engineer who picks up new technologies quickly. Competed in 6 hackathons.",
                university="McGill University",
                graduation_year=2027,
                skills="JavaScript,Node.js,React,MongoDB,Firebase",
                github_url="https://github.com",
                linkedin_url="https://linkedin.com",
                xp=0,
            ),
        ]
        for data in profiles_data:
            StudentProfile.objects.create(**data)
        self.stdout.write(f"  Created {len(profiles_data)} student profiles")

    def _create_teams(self, competitions, students):
        teams = []

        # Competition 1 — AI Productivity Tool Challenge
        t1 = Team.objects.create(name="Neural Squad", competition=competitions[0])
        TeamMember.objects.create(team=t1, user=students[0], is_captain=True)
        TeamMember.objects.create(team=t1, user=students[1], is_captain=False)
        teams.append(t1)

        t2 = Team.objects.create(name="ByteBuilders", competition=competitions[0])
        TeamMember.objects.create(team=t2, user=students[2], is_captain=True)
        TeamMember.objects.create(team=t2, user=students[3], is_captain=False)
        teams.append(t2)

        # Competition 2 — Fintech Dashboard
        t3 = Team.objects.create(name="StackOverflow Enjoyers", competition=competitions[1])
        TeamMember.objects.create(team=t3, user=students[4], is_captain=True)
        TeamMember.objects.create(team=t3, user=students[0], is_captain=False)
        teams.append(t3)

        self.stdout.write(f"  Created {len(teams)} teams")
        return teams

    def _create_submissions(self, teams, competitions):
        Submission.objects.create(
            team=teams[0],
            competition=competitions[0],
            file_url="https://github.com",
            description=(
                "We built a VS Code extension that reviews your code in real-time using GPT-4, "
                "highlights potential bugs, and suggests improvements inline. Built with TypeScript, "
                "Python, and the OpenAI API."
            ),
        )
        Submission.objects.create(
            team=teams[1],
            competition=competitions[0],
            file_url="https://github.com",
            description=(
                "An AI standup bot for Slack that automatically summarises your GitHub activity "
                "each morning and posts a concise standup update to your team channel."
            ),
        )
        Submission.objects.create(
            team=teams[2],
            competition=competitions[1],
            file_url="https://github.com",
            description=(
                "A personal finance dashboard with AI-powered spending insights, goal tracking, "
                "and a conversational interface to query your financial data in plain English."
            ),
        )
        self.stdout.write("  Created 3 submissions")
