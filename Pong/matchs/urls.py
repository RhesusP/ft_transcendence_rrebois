from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path("matches/<str:username>:<str:word>", MatchHistoryView.as_view(), name="matchHistory"),
    path("match/<int:match_id>", MatchScoreView.as_view(), name="matchScore"),
    path("tournament/create/", CreateTournamentView.as_view(), name="createTournament"),
    path("tournament/join/<str:tournament_id>", JoinTournamentView.as_view(), name="joinTournament"),
    path("tournament/play/<str:tournament_id>", PlayTournamentView.as_view(), name="playTournament"),
    path("tournament/history/", TournamentDisplayAllView.as_view(), name="tournamentHistory"),
    path("tournament/history/<str:username>", TournamentDisplayAllUserView.as_view(), name="tournamentUserHistory"),
    path("tournament/display/<str:tournament_id>", TournamentDisplayOneView.as_view(), name="tournamentDisplay"),
]
