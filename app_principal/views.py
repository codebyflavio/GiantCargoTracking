from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import logging
from .models import DadosImportados
from .serializers import DadosImportadosSerializer

logger = logging.getLogger('auth')

def custom_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            
            group_name = user.groups.first().name if user.groups.exists() else 'Sem grupo'
            logger.info(f'Login realizado - Usuário: {username}, Grupo: {group_name}')
            
            return redirect('/api/')
        else:
            messages.error(request, 'Credenciais inválidas')
            logger.warning(f'Tentativa de login falhada - Usuário: {username}')
    
    return render(request, 'registration/login.html')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = request.user
    group_name = user.groups.first().name if user.groups.exists() else 'Sem grupo'
    
    return Response({
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'group': group_name,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser
    })

# View para a página principal
@login_required
def home(request):
    role = request.user.groups.first().name if request.user.groups.exists() else 'visualizador'
    return render(request, 'index.html', {'role': role})

@login_required
def api_home(request):
    user = request.user
    group_name = user.groups.first().name if user.groups.exists() else 'Sem grupo'
    
    context = {
        'user': user,
        'group': group_name,
        'role': group_name.lower()
    }
    return render(request, 'api_home.html', context)

# Listar todos os dados
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dados_list(request):
    dados = DadosImportados.objects.all()
    serializer = DadosImportadosSerializer(dados, many=True)
    return Response(serializer.data)

# Atualizar campos específicos (PATCH)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def dados_update(request, pk):
    try:
        dado = DadosImportados.objects.get(pk=pk)
    except DadosImportados.DoesNotExist:
        return Response({'detail': 'Não encontrado'}, status=404)

    # Partial=True permite atualizar apenas alguns campos
    serializer = DadosImportadosSerializer(dado, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)
