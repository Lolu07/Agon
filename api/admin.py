"""
Agon — Django Admin registrations.

All core models are registered so they can be managed via /admin/.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Competition, StudentProfile, Submission, Team, TeamMember, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Extended admin for the custom User model."""

    list_display = ("email", "first_name", "last_name", "role", "company_name", "is_staff")
    list_filter = ("role", "is_staff", "is_active")
    search_fields = ("email", "first_name", "last_name", "company_name")
    ordering = ("email",)

    fieldsets = BaseUserAdmin.fieldsets + (
        ("Agon", {"fields": ("role", "company_name")}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Agon", {"fields": ("role", "company_name")}),
    )


@admin.register(Competition)
class CompetitionAdmin(admin.ModelAdmin):
    list_display = ("title", "host_company", "deadline", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("title", "host_company__email", "host_company__company_name")
    ordering = ("-created_at",)
    date_hierarchy = "deadline"


class TeamMemberInline(admin.TabularInline):
    model = TeamMember
    extra = 0
    readonly_fields = ("joined_at",)


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("name", "competition", "created_at")
    search_fields = ("name", "competition__title")
    ordering = ("-created_at",)
    inlines = [TeamMemberInline]


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ("user", "team", "is_captain", "joined_at")
    list_filter = ("is_captain",)
    search_fields = ("user__email", "team__name")


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ("team", "competition", "file_url", "submitted_at")
    search_fields = ("team__name", "competition__title")
    ordering = ("-submitted_at",)


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "university", "rank", "xp", "updated_at")
    list_filter = ("rank",)
    search_fields = ("user__email", "user__first_name", "user__last_name", "university")
    ordering = ("-xp",)
    readonly_fields = ("rank", "updated_at")
