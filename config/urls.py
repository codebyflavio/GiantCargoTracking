from django.contrib import admin
from django.urls import path, include
from app_principal.views import home  # importe sua view home
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home, name='home'),  # Rota raiz com sua view home (renderizando index.html)
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
    path('api/', include('app_principal.urls')),  # API endpoints
]
