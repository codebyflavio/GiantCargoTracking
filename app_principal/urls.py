from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('dados/', views.dados_list, name='dados_list'),
    path('dados/<int:pk>/', views.dados_update, name='dados_update'),
]