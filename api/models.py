"""
Agon — Core data models.

Tables:
    User           — Extended Django user with a role field (Student | Company)
    Competition    — A hackathon/challenge hosted by a company
    Team           — A group of students competing in a Competition
    TeamMember     — Through table linking Users (students) to Teams
    Submission     — A team's project deliverable for a Competition
    StudentProfile — Public profile for students (XP, rank, skills, links)
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model. Extends Django's AbstractUser so we retain
    all built-in auth functionality (password hashing, sessions, etc.)
    while adding Agon-specific fields.

    Role controls what a user can do:
        STUDENT  — can join/create teams, make submissions
        COMPANY  — can create and manage competitions
    """

    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        COMPANY = "company", "Company"

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.STUDENT,
    )
    # Only populated when role == COMPANY
    company_name = models.CharField(max_length=255, blank=True, null=True)

    # Use email as the primary identifier for login
    email = models.EmailField(unique=True)
    USERNAME_FIELD = "email"
    # username is still required by AbstractUser but we make it optional
    REQUIRED_FIELDS = ["username", "first_name", "last_name"]

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    # ── Convenience properties ─────────────────────────────────────────────────
    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_company(self):
        return self.role == self.Role.COMPANY


class Competition(models.Model):
    """
    A hackathon or challenge posted by a Company user.

    Only users with role=COMPANY should be able to create competitions.
    This constraint is enforced at the view/permission layer.
    """

    title = models.CharField(max_length=255)
    description = models.TextField()
    host_company = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="hosted_competitions",
        limit_choices_to={"role": User.Role.COMPANY},
    )
    deadline = models.DateTimeField()
    prize_description = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "competitions"
        ordering = ["-created_at"]
        verbose_name = "Competition"
        verbose_name_plural = "Competitions"

    def __str__(self):
        return f"{self.title} (hosted by {self.host_company.company_name or self.host_company.email})"


class Team(models.Model):
    """
    A team of students that competes in a specific Competition.

    Members are linked via the TeamMember through-model so we can
    store per-membership metadata (e.g. is_captain).
    """

    name = models.CharField(max_length=255)
    competition = models.ForeignKey(
        Competition,
        on_delete=models.CASCADE,
        related_name="teams",
    )
    members = models.ManyToManyField(
        User,
        through="TeamMember",
        related_name="teams",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "teams"
        # A team name must be unique within a competition
        unique_together = [["name", "competition"]]
        verbose_name = "Team"
        verbose_name_plural = "Teams"

    def __str__(self):
        return f"{self.name} — {self.competition.title}"


class TeamMember(models.Model):
    """
    Through table for the Team <-> User many-to-many relationship.
    Tracks which member is the team captain.
    """

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="memberships")
    is_captain = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "team_members"
        # A user can only be on one team per competition (enforced via unique_together)
        unique_together = [["team", "user"]]
        verbose_name = "Team Member"
        verbose_name_plural = "Team Members"

    def __str__(self):
        role = "Captain" if self.is_captain else "Member"
        return f"{self.user.email} → {self.team.name} ({role})"


class Submission(models.Model):
    """
    A team's final project submission for a Competition.

    A team may only submit once per competition (unique_together constraint).
    file_url should point to a GitHub repo, a deployed app URL, or a
    file-hosting link (e.g. Google Drive, S3).
    """

    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="submissions",
    )
    competition = models.ForeignKey(
        Competition,
        on_delete=models.CASCADE,
        related_name="submissions",
    )
    file_url = models.URLField(max_length=2048)
    description = models.TextField(blank=True, default="")
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "submissions"
        # One submission per team per competition
        unique_together = [["team", "competition"]]
        ordering = ["-submitted_at"]
        verbose_name = "Submission"
        verbose_name_plural = "Submissions"

    def __str__(self):
        return f"Submission by {self.team.name} for {self.competition.title}"


class StudentProfile(models.Model):
    """
    Public profile for a Student user.

    XP is awarded when a team wins or places in a competition (future feature).
    Rank is automatically calculated from XP on every save.

    resume_url / transcript_url are Google Drive / Dropbox share links —
    no file storage infrastructure required for MVP.
    """

    RANK_CHOICES = [
        ("bronze", "Bronze"),
        ("silver", "Silver"),
        ("gold", "Gold"),
        ("platinum", "Platinum"),
        ("elite", "Elite"),
    ]

    # Sorted descending so _calculate_rank() can short-circuit
    XP_THRESHOLDS = [
        ("elite", 2000),
        ("platinum", 1000),
        ("gold", 500),
        ("silver", 200),
        ("bronze", 0),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    bio = models.TextField(blank=True, default="")
    university = models.CharField(max_length=255, blank=True)
    graduation_year = models.PositiveIntegerField(null=True, blank=True)
    # Comma-separated skill tags e.g. "Python,React,Machine Learning"
    skills = models.TextField(blank=True, default="")
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    resume_url = models.URLField(blank=True)       # Google Drive / Dropbox share link
    transcript_url = models.URLField(blank=True)   # Google Drive / Dropbox share link
    xp = models.PositiveIntegerField(default=0)
    rank = models.CharField(max_length=20, choices=RANK_CHOICES, default="bronze")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "student_profiles"
        verbose_name = "Student Profile"
        verbose_name_plural = "Student Profiles"

    def __str__(self):
        return f"{self.user.email} — {self.rank.capitalize()} ({self.xp} XP)"

    def _calculate_rank(self):
        for rank, threshold in self.XP_THRESHOLDS:
            if self.xp >= threshold:
                return rank
        return "bronze"

    def save(self, *args, **kwargs):
        self.rank = self._calculate_rank()
        super().save(*args, **kwargs)
