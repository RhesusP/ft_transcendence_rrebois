from django.db import models
from userStats.models import User


class Match(models.Model):
    player1 = models.ForeignKey(User, related_name='player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(User, related_name='player2', on_delete=models.CASCADE)
    scoreP1 = models.IntegerField(default=0)
    scoreP2 = models.IntegerField(default=0)
    winner = models.ForeignKey(User, related_name='winner', on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.player1} vs {self.player2}'


class Tournament(models.Model):
    name = models.CharField(max_length=100)
    players = models.ManyToManyField(User, on_delete=models.CASCADE)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    status_choices = [
        ('upcoming', 'Upcoming'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
    ]
    matches = models.ManyToManyField(Match, on_delete=models.CASCADE)
    status = models.CharField(choices=status_choices, default='upcoming', max_length=50)

    def __str__(self):
        return self.name
