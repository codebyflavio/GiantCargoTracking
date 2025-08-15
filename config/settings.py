from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# Segurança - IMPORTANTE!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'troque_essa_chave_por_uma_segura')  # Use variável de ambiente em produção

DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'  # False em produção

ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', '').split(',') if os.getenv('DJANGO_ALLOWED_HOSTS') else []

# Apps instalados
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Suas apps
    'app_principal',  # Forma recomendada de registrar apps
    'rest_framework',
    'corsheaders',

]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Para servir static files em produção
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

# Configuração de Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'templates',          # Templates globais
            BASE_DIR / 'config' / 'templates',  # Templates específicos do app core
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                #'core.context_processors.settings_export',  # Exemplo de context processor customizado
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Banco de Dados
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'postgres',
        'PASSWORD': 'Flavio123teste',
        'HOST': 'localhost',  # ou IP do servidor do banco
        'PORT': '5432',       # porta padrão do PostgreSQL
    }
}

# Validação de senha (recomendado ativar em produção)
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
] if not DEBUG else []

# Internacionalização
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Arquivos Estáticos
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'config' / 'static',  # Ajustado para apontar para config/static
]

STATIC_ROOT = BASE_DIR / 'staticfiles'  # Para collectstatic

# Armazenamento de arquivos de mídia
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

LOGIN_URL = 'login'               # Nome da rota para login (ex: path('login/', ...)
LOGIN_REDIRECT_URL = 'api_home'   # Redirecionar para /api/ após login
LOGOUT_REDIRECT_URL = 'login'     # Nome da rota para onde redirecionar após logout

# Configurações customizadas
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Configuração para WhiteNoise (static files em produção)
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Adicione ao final do settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

CORS_ALLOW_CREDENTIALS = True

SESSION_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'auth.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'auth': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}

os.makedirs(BASE_DIR / 'logs', exist_ok=True)
