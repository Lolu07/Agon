"""
Agon — API Views.

Uses DRF ModelViewSets for clean, consistent CRUD endpoints.
Custom actions and permission logic are layered on top.

ViewSets registered:
    UserViewSet            — /users/
    CompetitionViewSet     — /competitions/
    TeamViewSet            — /teams/
    SubmissionViewSet      — /submissions/
    StudentProfileViewSet  — /profiles/

Auth endpoints:
    RegisterView         — /auth/register/
    CustomTokenObtainPairView — /auth/login/
"""

from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Competition, StudentProfile, Submission, Team, TeamMember, User
from .serializers import (
    CompetitionDetailSerializer,
    CompetitionListSerializer,
    CustomTokenObtainPairSerializer,
    StudentProfileDetailSerializer,
    StudentProfileListSerializer,
    SubmissionDetailSerializer,
    SubmissionListSerializer,
    TeamDetailSerializer,
    TeamListSerializer,
    TeamMemberSerializer,
    UserDetailSerializer,
    UserPublicSerializer,
    UserRegisterSerializer,
)


# ── Custom Permission Classes ──────────────────────────────────────────────────

class IsCompany(permissions.BasePermission):
    """Grants access only to authenticated users with role=COMPANY."""

    message = "Only Company accounts can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_company
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission: allow read to everyone authenticated,
    write only to the object's owner.

    Expects the model instance to have a field that resolves to the owner.
    Override `owner_field` in the view to customise which field to check.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner_field = getattr(view, "owner_field", None)
        if owner_field:
            return getattr(obj, owner_field) == request.user
        return obj == request.user


# ── Auth Views ─────────────────────────────────────────────────────────────────

class RegisterView(CreateAPIView):
    """
    POST /api/v1/auth/register/

    Creates a new user account. No authentication required.
    """

    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    POST /api/v1/auth/login/

    Returns access + refresh JWT tokens plus basic user info.
    """

    serializer_class = CustomTokenObtainPairSerializer


# ── User ViewSet ───────────────────────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    """
    GET    /api/v1/users/        — list all users (admin only)
    GET    /api/v1/users/{id}/   — retrieve a user profile
    PUT    /api/v1/users/{id}/   — full update (owner only)
    PATCH  /api/v1/users/{id}/   — partial update (owner only)
    DELETE /api/v1/users/{id}/   — delete account (owner or admin)

    GET    /api/v1/users/me/     — shortcut: return the current user's profile
    """

    queryset = User.objects.all()
    serializer_class = UserDetailSerializer
    owner_field = None  # Checked directly against request.user in has_object_permission

    def get_permissions(self):
        if self.action == "list":
            return [permissions.IsAdminUser()]
        if self.action in ("retrieve", "me"):
            return [permissions.IsAuthenticated()]
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        return [permissions.IsAuthenticated()]

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj == request.user or request.user.is_staff

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """GET /api/v1/users/me/ — Returns the currently authenticated user."""
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)


# ── Competition ViewSet ────────────────────────────────────────────────────────

class CompetitionViewSet(viewsets.ModelViewSet):
    """
    GET    /api/v1/competitions/        — list all active competitions (public)
    POST   /api/v1/competitions/        — create competition (company only)
    GET    /api/v1/competitions/{id}/   — retrieve competition detail (public)
    PUT    /api/v1/competitions/{id}/   — update competition (owner only)
    PATCH  /api/v1/competitions/{id}/   — partial update (owner only)
    DELETE /api/v1/competitions/{id}/   — delete competition (owner only)
    """

    queryset = Competition.objects.select_related("host_company").all()
    owner_field = "host_company"

    def get_serializer_class(self):
        if self.action == "list":
            return CompetitionListSerializer
        return CompetitionDetailSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsCompany()]
        return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]

    def perform_create(self, serializer):
        """Automatically assign the authenticated company as host."""
        serializer.save(host_company=self.request.user)


# ── Team ViewSet ───────────────────────────────────────────────────────────────

class TeamViewSet(viewsets.ModelViewSet):
    """
    GET    /api/v1/teams/              — list teams (filterable by competition_id)
    POST   /api/v1/teams/              — create a team (student only)
    GET    /api/v1/teams/{id}/         — retrieve team detail
    PUT    /api/v1/teams/{id}/         — update team (captain only)
    PATCH  /api/v1/teams/{id}/         — partial update (captain only)
    DELETE /api/v1/teams/{id}/         — delete team (captain only)

    POST   /api/v1/teams/{id}/join/    — join a team (student only)
    POST   /api/v1/teams/{id}/leave/   — leave a team
    GET    /api/v1/teams/{id}/members/ — list team members
    """

    queryset = Team.objects.prefetch_related("memberships__user", "members").all()

    def get_serializer_class(self):
        if self.action == "list":
            return TeamListSerializer
        return TeamDetailSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve", "members"):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        competition_id = self.request.query_params.get("competition_id")
        if competition_id:
            qs = qs.filter(competition_id=competition_id)
        return qs

    def _is_captain(self, team, user):
        return TeamMember.objects.filter(team=team, user=user, is_captain=True).exists()

    def perform_create(self, serializer):
        """Create team and automatically make the creator the captain."""
        team = serializer.save()
        TeamMember.objects.create(team=team, user=self.request.user, is_captain=True)

    def update(self, request, *args, **kwargs):
        team = self.get_object()
        if not self._is_captain(team, request.user):
            return Response(
                {"detail": "Only the team captain can edit team details."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        team = self.get_object()
        if not self._is_captain(team, request.user):
            return Response(
                {"detail": "Only the team captain can delete the team."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def join(self, request, pk=None):
        """
        POST /api/v1/teams/{id}/join/
        Adds the current user to the team. Students only.
        """
        team = self.get_object()
        user = request.user

        if not user.is_student:
            return Response(
                {"detail": "Only Student accounts can join teams."},
                status=status.HTTP_403_FORBIDDEN,
            )

        already_on_team = TeamMember.objects.filter(
            user=user, team__competition=team.competition
        ).exists()
        if already_on_team:
            return Response(
                {"detail": "You are already on a team for this competition."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        membership, created = TeamMember.objects.get_or_create(
            team=team, user=user, defaults={"is_captain": False}
        )
        if not created:
            return Response(
                {"detail": "You are already a member of this team."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = TeamMemberSerializer(membership)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def leave(self, request, pk=None):
        """
        POST /api/v1/teams/{id}/leave/
        Removes the current user from the team.
        """
        team = self.get_object()
        deleted, _ = TeamMember.objects.filter(team=team, user=request.user).delete()
        if not deleted:
            return Response(
                {"detail": "You are not a member of this team."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({"detail": "You have left the team."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def members(self, request, pk=None):
        """
        GET /api/v1/teams/{id}/members/
        Returns the full member list for a team.
        """
        team = self.get_object()
        memberships = team.memberships.select_related("user").all()
        serializer = TeamMemberSerializer(memberships, many=True)
        return Response(serializer.data)


# ── Submission ViewSet ─────────────────────────────────────────────────────────

class SubmissionViewSet(viewsets.ModelViewSet):
    """
    GET    /api/v1/submissions/        — list submissions
    POST   /api/v1/submissions/        — create a submission
    GET    /api/v1/submissions/{id}/   — retrieve submission detail
    PUT    /api/v1/submissions/{id}/   — update submission
    PATCH  /api/v1/submissions/{id}/   — partial update
    DELETE /api/v1/submissions/{id}/   — delete submission

    Supports filtering by:
        ?competition_id=<id>
        ?team_id=<id>
    """

    queryset = Submission.objects.select_related(
        "team", "competition", "team__competition"
    ).all()

    def get_serializer_class(self):
        if self.action == "list":
            return SubmissionListSerializer
        return SubmissionDetailSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        competition_id = self.request.query_params.get("competition_id")
        team_id = self.request.query_params.get("team_id")
        if competition_id:
            qs = qs.filter(competition_id=competition_id)
        if team_id:
            qs = qs.filter(team_id=team_id)
        return qs

    def _user_is_team_member(self, team):
        return TeamMember.objects.filter(team=team, user=self.request.user).exists()

    def perform_create(self, serializer):
        team = serializer.validated_data["team"]
        if not self._user_is_team_member(team):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You must be a member of the team to submit.")
        serializer.save()

    def update(self, request, *args, **kwargs):
        submission = self.get_object()
        if not self._user_is_team_member(submission.team):
            return Response(
                {"detail": "Only team members can update this submission."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        submission = self.get_object()
        if not self._user_is_team_member(submission.team):
            return Response(
                {"detail": "Only team members can delete this submission."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)


# ── Student Profile ViewSet ────────────────────────────────────────────────────

class StudentProfileViewSet(viewsets.ModelViewSet):
    """
    GET    /api/v1/profiles/        — list all profiles (public, filterable)
    POST   /api/v1/profiles/        — create own profile (student only)
    GET    /api/v1/profiles/{id}/   — retrieve a profile (public)
    PUT    /api/v1/profiles/{id}/   — update profile (owner only)
    PATCH  /api/v1/profiles/{id}/   — partial update (owner only)
    DELETE /api/v1/profiles/{id}/   — delete profile (owner only)

    GET    /api/v1/profiles/me/     — return own profile or 404

    Filtering:
        ?skill=python          — skills__icontains
        ?rank=gold             — exact rank match
        ?search=name_or_uni    — first_name, last_name, university
    """

    queryset = StudentProfile.objects.select_related("user").all()
    owner_field = "user"

    def get_serializer_class(self):
        if self.action == "list":
            return StudentProfileListSerializer
        return StudentProfileDetailSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        skill = self.request.query_params.get("skill")
        rank = self.request.query_params.get("rank")
        search = self.request.query_params.get("search")
        if skill:
            qs = qs.filter(skills__icontains=skill)
        if rank:
            qs = qs.filter(rank=rank)
        if search:
            qs = qs.filter(
                Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(university__icontains=search)
            )
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        profile = self.get_object()
        if profile.user != request.user:
            return Response(
                {"detail": "You can only edit your own profile."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        profile = self.get_object()
        if profile.user != request.user:
            return Response(
                {"detail": "You can only delete your own profile."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """GET /api/v1/profiles/me/ — Returns own profile or 404."""
        try:
            profile = request.user.profile
        except StudentProfile.DoesNotExist:
            return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = StudentProfileDetailSerializer(profile)
        return Response(serializer.data)
