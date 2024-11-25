import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField
from userManagement.models import User, UserData


# Create your models here.


class Match(models.Model):
    players = models.ManyToManyField('userManagement.User', related_name="matchs", default=list)
    winner = models.ManyToManyField('userManagement.User', related_name="winners", default=list, blank=True)
    is_pong = models.BooleanField(default=True)
    timeMatch = models.DateTimeField(auto_now_add=True)
    count = models.IntegerField(default=2)
    deconnection = models.BooleanField(default=False)
    is_finished = models.BooleanField(default=False)
    session_id = models.CharField(default=False, editable=False, unique=True)

    class Meta:
        ordering = ['-timeMatch']

    def get_winner_score(self):
        if self.winner:
            for score in self.scores.all():
                if score.player == self.winner:
                    return score.score

    def serialize(self):
        winners_list = ['deleted_user' for i in range(0, self.count // 2)]
        if len(winners_list) > 0:
            for i, winner in enumerate(self.winner.all()):
                winners_list[i] = winner.username

        return {
            'id': self.id,
            'game': 'pong' if self.is_pong else 'purrinha',
            "players": [{"username": score.player.username if score.player else "deleted_user", "score": score.score}
                        for score in self.scores.all()],
            "count": self.count,
            "winner": winners_list,
            "deconnection": self.deconnection,
            "timestamp": self.timeMatch.strftime("%b %d %Y, %I:%M %p"),
            "is_finished": self.is_finished,
        }


class Score(models.Model):
    player = models.ForeignKey('userManagement.User', on_delete=models.SET_NULL, null=True, related_name='scores')
    match = models.ForeignKey('Match', on_delete=models.CASCADE, related_name='scores')
    score = models.IntegerField(default=0)


class Tournament(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(unique=True, max_length=15)
    players = models.ManyToManyField('userManagement.User', related_name='tournaments', default=list)
    number_players = models.IntegerField()
    is_closed = models.BooleanField(default=False)
    is_finished = models.BooleanField(default=False)
    winner = models.ForeignKey('userManagement.User', on_delete=models.SET_NULL, null=True, related_name='won_tournament')

    def serialize(self):
        winner_replace = 'deleted_user' if self.is_finished else 'unknown'
        if self.is_finished:
            status = 'finished'
        elif self.is_closed:
            status = 'running'
        else:
            status = 'waiting for players'
        return {
            'id': self.id,
            'name': self.name,
            'status': status,
            'nb_players': self.number_players,
            'players': [player.serialize() for player in self.players.all()],
            'winner': self.winner.username if self.winner else winner_replace,
            'matchs': [match.serialize() for match in self.tournament_matchs.all()],
            }

    def get_id(self):
        return self.id

    def get_unfinished_matchs(self):
        return [match for match in self.tournament_matchs.all() if not match.match]

class TournamentMatch(models.Model):

    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='tournament_matchs')
    match = models.ForeignKey(Match, on_delete=models.SET_NULL, null=True, blank=True, related_name='tournament_match')
    score = ArrayField(models.IntegerField(), null=True, blank=True)
    players = models.ManyToManyField('userManagement.User', related_name='tournament_match_player', default=list)

    def serialize(self):
        match_result = {
            'players': [{**player.serialize(), 'score': 0} for player in self.players.all()],
            'winner': ['n/a'],
            'is_finished': self.match.is_finished if self.match else False
        }

        if self.match:
            serialized = self.match.serialize()
            for player in match_result['players']:
                score = next((p['score'] for p in serialized['players'] if p['username'] == player['Username']), 0)
                player['score'] = score

            match_result['winner'] = serialized['winner']

        return match_result

