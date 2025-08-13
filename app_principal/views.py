from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import DadosImportados
from .serializers import DadosImportadosSerializer

# View para a página principal
@login_required
def home(request):
    role = request.user.groups.first().name if request.user.groups.exists() else 'visualizador'
    return render(request, 'index.html', {'role': role})

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
