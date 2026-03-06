"""
Root URL configuration for the Agon project.

All API routes are namespaced under /api/v1/.
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("api.urls")),
]
