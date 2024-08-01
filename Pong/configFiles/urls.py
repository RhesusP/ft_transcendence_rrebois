"""
URL configuration for configFiles project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
# from matchs import urls as murls
# from userManagement import urls as userUrls

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include("userManagement.urls")),
    path('', include("matchs.urls")),
    path('pong/', include("pongGame.urls")),
]

from django.conf import settings
from django.conf.urls.static import static
#
if bool(settings.DEBUG):
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)