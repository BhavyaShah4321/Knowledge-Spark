"""
URL configuration for final_year_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
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
from django.urls import path,include
import final_year_project
import final_year_project.routers

from django.conf import settings
from django.conf.urls.static import static
from final_year_project.views import video_call
urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/",include(final_year_project.routers.router.urls)),
    path("video-call/<str:id>/",video_call,name="video-call")
    
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

