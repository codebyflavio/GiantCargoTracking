from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import DadosImportados
from .serializers import DadosImportadosSerializer
from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def home(request):
    role = request.user.groups.first().name if request.user.groups.exists() else 'visualizador'
    return render(request, 'index.html', {'role': role})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dados_list(request):
    dados = DadosImportados.objects.all()
    serializer = DadosImportadosSerializer(dados, many=True)
    return Response(serializer.data)
