from django.urls import path
from .views import dados_list

urlpatterns = [
    path('dados/', dados_list, name='dados-list'),
]
