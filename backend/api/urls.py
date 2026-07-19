from django.urls import path
from . import views

urlpatterns=[
    path("notes/",views.NoteListCreate.as_view(),name="note-list"),
    path("notes/delete/<int:pk>/",views.NoteDelete.as_view(),name="delete-note"),
    path("notes/restore/<int:pk>/",views.NoteRestore.as_view(),name="restore-note"),
    path("notes/trash/",views.TrashList.as_view(),name="trash-list"),
    path("notes/trash/<int:pk>/",views.NotePermanentDelete.as_view(),name="permanent-delete-note"),
    path("password-reset/",views.PasswordResetRequestView.as_view(),name="password-reset"),
    path("password-reset/confirm/",views.PasswordResetConfirmView.as_view(),name="password-reset-confirm"),
]