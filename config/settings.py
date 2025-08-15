# config/settings.py
from pathlib import Path
import os
import logging
from dotenv import load_dotenv
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent

# Carrega .env (apenas para desenvolvimento/local). Em produção, prefira variáveis de ambiente do sistema.
env_path = BASE_DIR / '.env'
if env_path.exists():
    load_dotenv(env_path)

# -------------------------
# Helpers para variáveis de ambiente
# -------------------------
def get_env(name: str, default=None, required: bool = False) -> str:
    value = os.environ.get(name, default)
    if required and (value is None or value == ""):
        raise ImproperlyConfigured(f"Set the {name} environment variable")
    return value

def get_bool_env(name: str, default: bool = False) -> bool:
    val = os.environ.get(name, None)
    if val is None:
        return default
    return str(val).lower() in ("1", "true", "yes", "on")

# -------------------------
# Segurança / Debug / Hosts
# -------------------------
SECRET_KEY = get_env('DJANGO_SECRET_KEY', 'troque_essa_chave_por_uma_segura')
DEBUG = get_bool_env('DJANGO_DEBUG', True)

_allowed = get_env('DJANGO_ALLOWED_HOSTS', '127.0.0.1,localhost')
ALLOWED_HOSTS = [h.strip() for h in _allowed.split(',') if h.strip()]

# -------------------------
# Apps / Middleware / URLs
# -------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # suas apps
    'app_principal',
    'rest_framework',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # deve ficar antes de CommonMiddleware
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'templates',
            BASE_DIR / 'config' / 'templates',
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# -------------------------
# Logger base (disponível para uso no settings)
# -------------------------
logger = logging.getLogger(__name__)

# -------------------------
# Banco de Dados
# -------------------------
DATABASES = {
    'default': {
        'ENGINE': get_env('DB_ENGINE', 'django.db.backends.postgresql'),
        'NAME': get_env('DB_NAME', required=True),
        'USER': get_env('DB_USER', required=True),
        'PASSWORD': get_env('DB_PASSWORD', required=True),
        'HOST': get_env('DB_HOST', 'localhost'),
        'PORT': get_env('DB_PORT', '5432'),
        'CONN_MAX_AGE': int(get_env('DB_CONN_MAX_AGE', 60)),
    }
}

logger.debug(
    "Database configured: engine=%s host=%s db=%s",
    DATABASES['default']['ENGINE'],
    DATABASES['default']['HOST'],
    DATABASES['default']['NAME'],
)

# -------------------------
# Password validators
# -------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
] if not DEBUG else []

# -------------------------
# Internationalization
# -------------------------
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# -------------------------
# Static / Media
# -------------------------
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'config' / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# -------------------------
# Auth / Redirects
# -------------------------
LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = 'api_home'
LOGOUT_REDIRECT_URL = 'login'

# -------------------------
# CORS / CSRF / Cookies
# -------------------------
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
CORS_ALLOW_CREDENTIALS = True

SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = get_bool_env('SESSION_COOKIE_SECURE', False)
CSRF_COOKIE_SECURE = get_bool_env('CSRF_COOKIE_SECURE', False)

# -------------------------
# Logging (cria pasta se necessário)
# -------------------------
LOGS_DIR = BASE_DIR / 'logs'
LOGS_DIR.mkdir(parents=True, exist_ok=True)

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
            'filename': str(LOGS_DIR / 'auth.log'),
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
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}

# -------------------------
# Outros
# -------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
