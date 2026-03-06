"""
Agon — DRF Serializers.

Each serializer maps a model to its JSON representation and handles
validation. We use separate serializers for list vs detail views where
the data shape meaningfully differs.
"""

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Competition, StudentProfile, Submission, Team, TeamMember, User


# ── User ───────────────────────────────────────────────────────────────────────

class UserPublicSerializer(serializers.ModelSerializer):
    """
    Read-only, minimal user representation safe to embed inside other objects.
    Never exposes password hashes or sensitive fields.
    """

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "role", "company_name"]
        read_only_fields = fields


class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Used exclusively for POST /auth/register/.
    Accepts a plaintext password, validates it, and hashes it before saving.
    """

    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm password")

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "company_name",
            "password",
            "password2",
        ]
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name": {"required": True},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        if attrs.get("role") == User.Role.COMPANY and not attrs.get("company_name"):
            raise serializers.ValidationError(
                {"company_name": "company_name is required for Company accounts."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Full user representation for GET/PUT/PATCH on /users/{id}/.
    Password is excluded — handled separately if needed.
    """

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "company_name",
            "is_active",
            "date_joined",
        ]
        read_only_fields = ["id", "date_joined", "role"]


# ── JWT Token ──────────────────────────────────────────────────────────────────

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extends the default JWT serializer to include basic user info
    in the login response alongside the token pair.
    """

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserPublicSerializer(self.user).data
        return data


# ── Competition ────────────────────────────────────────────────────────────────

class CompetitionListSerializer(serializers.ModelSerializer):
    """Compact representation for list views."""

    host_company = UserPublicSerializer(read_only=True)

    class Meta:
        model = Competition
        fields = [
            "id",
            "title",
            "host_company",
            "deadline",
            "is_active",
            "created_at",
        ]


class CompetitionDetailSerializer(serializers.ModelSerializer):
    """Full representation including description and prize info."""

    host_company = UserPublicSerializer(read_only=True)
    # Write-only field so POST body can send host_company_id
    host_company_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.COMPANY),
        source="host_company",
        write_only=True,
        required=False,  # Auto-assigned from the authenticated user in perform_create
    )

    class Meta:
        model = Competition
        fields = [
            "id",
            "title",
            "description",
            "host_company",
            "host_company_id",
            "deadline",
            "prize_description",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "host_company"]


# ── Team ───────────────────────────────────────────────────────────────────────

class TeamMemberSerializer(serializers.ModelSerializer):
    """Serializes a membership record including the embedded user."""

    user = UserPublicSerializer(read_only=True)

    class Meta:
        model = TeamMember
        fields = ["id", "user", "is_captain", "joined_at"]


class TeamListSerializer(serializers.ModelSerializer):
    """Compact representation for list views."""

    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = ["id", "name", "competition", "member_count", "created_at"]

    def get_member_count(self, obj):
        return obj.members.count()


class TeamDetailSerializer(serializers.ModelSerializer):
    """Full representation including nested members."""

    memberships = TeamMemberSerializer(many=True, read_only=True)
    competition_id = serializers.PrimaryKeyRelatedField(
        queryset=Competition.objects.all(),
        source="competition",
        write_only=True,
    )
    competition = CompetitionListSerializer(read_only=True)

    class Meta:
        model = Team
        fields = [
            "id",
            "name",
            "competition",
            "competition_id",
            "memberships",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "competition", "memberships"]


# ── Submission ─────────────────────────────────────────────────────────────────

class SubmissionListSerializer(serializers.ModelSerializer):
    """Compact representation for list views."""

    team_name = serializers.CharField(source="team.name", read_only=True)
    competition_title = serializers.CharField(source="competition.title", read_only=True)

    class Meta:
        model = Submission
        fields = [
            "id",
            "team_name",
            "competition_title",
            "file_url",
            "submitted_at",
        ]


class SubmissionDetailSerializer(serializers.ModelSerializer):
    """Full representation with nested team and competition info."""

    team = TeamListSerializer(read_only=True)
    team_id = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.all(),
        source="team",
        write_only=True,
    )
    competition = CompetitionListSerializer(read_only=True)
    competition_id = serializers.PrimaryKeyRelatedField(
        queryset=Competition.objects.all(),
        source="competition",
        write_only=True,
    )

    class Meta:
        model = Submission
        fields = [
            "id",
            "team",
            "team_id",
            "competition",
            "competition_id",
            "file_url",
            "description",
            "submitted_at",
            "updated_at",
        ]
        read_only_fields = ["id", "submitted_at", "updated_at", "team", "competition"]

    def validate(self, attrs):
        team = attrs.get("team") or (self.instance.team if self.instance else None)
        competition = attrs.get("competition") or (
            self.instance.competition if self.instance else None
        )
        # Ensure the team is registered for this competition
        if team and competition and team.competition_id != competition.id:
            raise serializers.ValidationError(
                "The team is not registered for this competition."
            )
        return attrs


# ── Student Profile ─────────────────────────────────────────────────────────────

class StudentProfileListSerializer(serializers.ModelSerializer):
    """Compact representation for talent discovery list view."""

    user = UserPublicSerializer(read_only=True)
    skills_list = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            "id", "user", "university", "graduation_year",
            "skills", "skills_list", "rank", "xp",
            "github_url", "linkedin_url", "portfolio_url",
        ]

    def get_skills_list(self, obj):
        if not obj.skills:
            return []
        return [s.strip() for s in obj.skills.split(",") if s.strip()]


class StudentProfileDetailSerializer(serializers.ModelSerializer):
    """Full profile including resume and transcript links."""

    user = UserPublicSerializer(read_only=True)
    skills_list = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            "id", "user", "bio", "university", "graduation_year",
            "skills", "skills_list", "github_url", "linkedin_url",
            "portfolio_url", "resume_url", "transcript_url",
            "rank", "xp", "updated_at",
        ]
        read_only_fields = ["id", "user", "rank", "xp", "updated_at"]

    def get_skills_list(self, obj):
        if not obj.skills:
            return []
        return [s.strip() for s in obj.skills.split(",") if s.strip()]
