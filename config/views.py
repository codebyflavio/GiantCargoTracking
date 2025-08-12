from django.contrib.auth.views import LoginView, LogoutView
from django.urls import reverse_lazy

class CustomLoginView(LoginView):
    template_name = 'login.html'  # crie esse template

class CustomLogoutView(LogoutView):
    next_page = reverse_lazy('login')