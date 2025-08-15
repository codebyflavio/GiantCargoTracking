from django.contrib import admin
from django.urls import path, include
from app_principal.views import home, custom_login, api_home  # Importar views customizadas
from django.contrib.auth import views as auth_views
from django.contrib.auth.views import LogoutView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home, name='home'),  # Rota raiz com sua view home (renderizando index.html)
    path('login/', custom_login, name='login'),
    path('api/', api_home, name='api_home'),
    path('api/', include('app_principal.urls')),  # API endpoints
        path(
        'logout/',
        LogoutView.as_view(next_page='/login/'),
        name='logout'
    ),
]
