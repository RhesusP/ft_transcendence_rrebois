from django.shortcuts import render
from userStats.models import User
from userStats.views import authenticate_user

def create_tournament(request):
    if request.method == 'POST':
        user = authenticate_user(request)

