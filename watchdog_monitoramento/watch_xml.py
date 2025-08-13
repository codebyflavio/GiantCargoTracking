# script_watchdog.py  (versão atualizada)
import os
import time
import shutil
from datetime import datetime, date
from decimal import Decimal, InvalidOperation
import xml.etree.ElementTree as ET
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import django
import sys
from typing import Optional, Tuple

# Setup Django
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from app_principal.models import DadosImportados
from django.db.models import DateField, DecimalField

class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'

BASE_DIR = os.path.dirname(__file__)
PASTA_MONITORADA = os.path.join(BASE_DIR, 'pastaMonitorada')
PASTA_LIDOS = os.path.join(BASE_DIR, 'pastaLidos')
os.makedirs(PASTA_MONITORADA, exist_ok=True)
os.makedirs(PASTA_LIDOS, exist_ok=True)

def log_info(msg: str) -> None:
    print(f"{Colors.BLUE}[INFO]{Colors.END} {msg}")

def log_success(msg: str) -> None:
    print(f"{Colors.GREEN}[SUCCESS]{Colors.END} {msg}")

def log_warning(msg: str) -> None:
    print(f"{Colors.YELLOW}[WARNING]{Colors.END} {msg}")

def log_error(msg: str) -> None:
    print(f"{Colors.RED}[ERROR]{Colors.END} {msg}")

def limpar_ref_giant(valor: Optional[str]) -> str:
    if not valor:
        return ''
    return valor.replace(' ', '').replace('.', '').replace('-', '').strip()

def parse_date(date_str: Optional[str]) -> Optional[date]:
    if not date_str or not date_str.strip():
        return None
    date_str = date_str.strip()
    for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None

def normaliza_valor(valor, field) -> Optional[object]:
    if valor is None or valor == "":
        return None

    if isinstance(field, DecimalField):
        try:
            if isinstance(valor, str):
                return Decimal(valor.replace(',', '.'))
            if isinstance(valor, (Decimal, float, int)):
                return Decimal(str(valor))
        except (InvalidOperation, ValueError):
            return None

    if isinstance(field, DateField):
        if isinstance(valor, str):
            return parse_date(valor)
        if isinstance(valor, (date, datetime)):
            return valor.date() if isinstance(valor, datetime) else valor

    # Para string, padroniza strip (mantive lower em seu código anterior, mas normalmente
    # é melhor não lowerizar todos os campos; aqui apenas strip)
    if isinstance(valor, str):
        return valor.strip()
    
    # Caso contrário, retorna valor "as is"
    return valor

# LISTA DOS CAMPOS QUE DEVEM SER IGNORADOS PELO SCRIPT (editáveis via UI apenas)
EDITABLE_FIELDS = [
    'q',
    'sostatus_releasedonholdreturned',
    'data_liberacao',
    'data_nfe',
    'numero_nfe',
    'nftgdt',
    'nftg',
    'dlvatdestination',
    'status_impexp',
    'eventos'
]

def dados_sao_iguais(obj: DadosImportados, data: dict) -> bool:
    """
    Compara valores do objeto com os valores vindos do XML,
    ignorando campos editáveis (EDITABLE_FIELDS).
    """
    for field in DadosImportados._meta.get_fields():
        if not hasattr(field, 'column') or field.name not in data:
            continue
        if field.name in EDITABLE_FIELDS:
            # Ignora campos editáveis na comparação
            continue

        valor_xml = normaliza_valor(data[field.name], field)
        valor_banco = normaliza_valor(getattr(obj, field.name), field)

        if valor_xml != valor_banco:
            log_info(f"Diferença no campo '{field.name}': banco='{valor_banco}' vs xml='{valor_xml}'")
            return False
    return True

def process_xml_content(xml_content: str) -> Tuple[int, int, int]:
    try:
        root = ET.fromstring(xml_content)
        items = root.findall('.//NewReportItem')
        if not items:
            log_warning("XML sem elementos NewReportItem.")
            return 0, 0, 0

        log_info(f"Processando {len(items)} itens do XML.")

        tag_to_field = {
            'Q': 'q',
            'C3': 'c3',
            'DELIVERYID': 'deliveryid',
            'SOSTATUS-RELEASEDONHOLDRETURNED': 'sostatus_releasedonholdreturned',
            'RELEASEDDT': 'data_liberacao',
            'MAWB': 'mawb',
            'HAWB': 'hawb',
            'CIPBRL': 'cipbrl',
            'REF.GIANT': 'ref_giant',
            'PC': 'pc',
            'GROSSWEIGHT': 'peso',
            'CHARGEABLEWEIGHT': 'peso_cobravel',
            'TYPE': 'tipo',
            'PUPDT': 'pupdt',
            'CIOK': 'ciok',
            'LIENTRYDT': 'lientrydt',
            'LIOK': 'liok',
            'OKTOSHIP': 'ok_to_ship',
            'LI': 'li',
            'HAWBDT': 'hawbdt',
            'ESTIMATEDBOOKINGDT': 'estimatedbookingdt',
            'ARRIVALDESTINATIONDT': 'arrivaldestinationdt',
            'FUNDSREQUEST': 'solicitacao_fundos',
            'FundsReceived': 'fundos_recebidos',
            'EADIDT': 'eadidt',
            'DIDUEDT': 'diduedt',
            'DIDUENUMBER': 'diduenumber',
            'ICMSPAID': 'icmspago',
            'CHANNELCOLOR': 'canal_cor',
            'CCRLSDDT': 'data_liberacao_ccr',
            'NFEDT': 'data_nfe',
            'NFE': 'numero_nfe',
            'NFTGDT': 'nftgdt',
            'NFTG': 'nftg',
            'DLVATDESTINATION': 'dlvatdestination',
            'StatusIMPEXP': 'status_impexp',
            'ESTIMATEDDATE': 'data_estimada',
            'EVENT': 'eventos',
            'REALLEADTIME': 'real_lead_time',
            'SHIPFAILUREDAYS': 'ship_failure_days',
            'FAILUREJUSTIFICATION': 'justificativa_atraso',
        }

        inserted = updated = unchanged = 0

        for item in items:
            # Monta dicionário com valores vindos do XML (sem ainda filtrar editáveis)
            raw_data = {}
            for tag_xml, field_name in tag_to_field.items():
                elem = item.find(tag_xml)
                if elem is not None and elem.text:
                    valor = elem.text.strip()
                    raw_data[field_name] = limpar_ref_giant(valor) if field_name == 'ref_giant' else valor

            # Se não tiver ref_giant, ignora
            if not raw_data.get('ref_giant'):
                log_warning("Item sem ref_giant ignorado.")
                continue

            # Filtra os campos que o script NÃO deve tocar (editáveis => serão ignorados)
            data = {k: v for k, v in raw_data.items() if k not in EDITABLE_FIELDS}

            # Conversão de tipos para campos específicos (aplica somente aos campos que estão em `data`)
            for field in DadosImportados._meta.get_fields():
                if not hasattr(field, 'column') or field.name not in data:
                    continue
                raw = data[field.name]
                if isinstance(field, DateField) and isinstance(raw, str):
                    data[field.name] = parse_date(raw)
                elif isinstance(field, DecimalField) and isinstance(raw, str):
                    try:
                        data[field.name] = Decimal(raw.replace(',', '.'))
                    except (InvalidOperation, ValueError):
                        data[field.name] = None

            try:
                obj = DadosImportados.objects.get(ref_giant=data.get('ref_giant'))
            except DadosImportados.DoesNotExist:
                # Ao criar, NÃO passamos campos editáveis (mantemos data filtrada)
                # Se quiser manter um valor default para campos editáveis, faça isso explicitamente aqui.
                DadosImportados.objects.create(**data)
                inserted += 1
                log_success(f"Item inserido ref_giant={data.get('ref_giant')}")
                continue

            # Se for igual (ignorando campos editáveis), conta como sem alteração
            if dados_sao_iguais(obj, {**raw_data}):
                unchanged += 1
                log_info(f"Item sem alterações ref_giant={data.get('ref_giant')}")
            else:
                # Atualiza apenas os campos em `data` (ou seja, NÃO atualizamos campos editáveis)
                if data:
                    for k, v in data.items():
                        setattr(obj, k, v)
                    # salva apenas os campos que foram modificados para eficiência
                    obj.save(update_fields=list(data.keys()))
                    updated += 1
                    log_success(f"Item atualizado ref_giant={data.get('ref_giant')}")
                else:
                    # data vazio significa que o XML só continha campos editáveis (que ignoramos),
                    # portanto não há nada a atualizar pelo script.
                    log_info(f"Ignorado update para ref_giant={data.get('ref_giant')} — apenas campos editáveis no XML.")
                    unchanged += 1

        return inserted, updated, unchanged

    except ET.ParseError as e:
        log_error(f"Erro no XML: {e}")
    except Exception as e:
        log_error(f"Erro inesperado: {e}")
    return 0, 0, 0

class XMLHandler(FileSystemEventHandler):
    def __init__(self):
        super().__init__()
        self.arquivos_lidos = 0
        self.arquivos_erro = 0
        self.itens_inseridos = 0
        self.itens_atualizados = 0
        self.itens_sem_alteracao = 0

    def print_status(self):
        print(
            f"{Colors.BOLD}Status:{Colors.END} "
            f"Arquivos: {Colors.GREEN}✓{self.arquivos_lidos}{Colors.END} | "
            f"{Colors.RED}✗{self.arquivos_erro}{Colors.END} | "
            f"Itens: {Colors.GREEN}+{self.itens_inseridos}{Colors.END} | "
            f"{Colors.BLUE}↗{self.itens_atualizados}{Colors.END} | "
            f"→{self.itens_sem_alteracao}",
            end='\r', flush=True
        )

    def on_created(self, event):
        if event.is_directory or not event.src_path.lower().endswith('.xml'):
            return
        filename = os.path.basename(event.src_path)
        try:
            log_info(f"Arquivo detectado: {filename}")
            time.sleep(2)  # espera para garantir arquivo completo

            with open(event.src_path, encoding='utf-8') as f:
                content = f.read()

            ins, upd, unch = process_xml_content(content)
            self.itens_inseridos += ins
            self.itens_atualizados += upd
            self.itens_sem_alteracao += unch
            self.arquivos_lidos += 1

            shutil.move(event.src_path, os.path.join(PASTA_LIDOS, filename))
            log_success(f"Arquivo processado: {filename}")

        except Exception as e:
            self.arquivos_erro += 1
            log_error(f"Erro processando {filename}: {e}")

        self.print_status()

def main():
    print(f"{Colors.BOLD}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}Monitoramento de XML - Início{Colors.END}")
    print(f"{Colors.BOLD}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}[CONFIG]{Colors.END} Pasta monitorada: {os.path.abspath(PASTA_MONITORADA)}")
    print(f"{Colors.BLUE}[CONFIG]{Colors.END} Pasta destino: {os.path.abspath(PASTA_LIDOS)}")
    print(f"{Colors.GREEN}[STATUS]{Colors.END} Monitoramento iniciado")

    handler = XMLHandler()
    observer = Observer()
    observer.schedule(handler, PASTA_MONITORADA, recursive=False)
    observer.start()

    print(f"{Colors.GREEN}[STATUS]{Colors.END} Monitoramento ativo (Ctrl+C para parar)")
    print("-" * 60)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}[STATUS]{Colors.END} Finalizando monitoramento...")
        observer.stop()
    observer.join()

    print(f"\n{Colors.BOLD}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}Resumo Final{Colors.END}")
    print(f"{Colors.BOLD}{'='*60}{Colors.END}")
    print(f"{Colors.GREEN}✓ Arquivos lidos com sucesso:{Colors.END} {handler.arquivos_lidos}")
    print(f"{Colors.RED}✗ Arquivos com erro:{Colors.END} {handler.arquivos_erro}")
    print(f"{Colors.GREEN}+ Itens inseridos:{Colors.END} {handler.itens_inseridos}")
    print(f"{Colors.BLUE}↗ Itens atualizados:{Colors.END} {handler.itens_atualizados}")
    print(f"→ Itens sem alteração: {handler.itens_sem_alteracao}")
    print(f"{Colors.BOLD}{'='*60}{Colors.END}")
    print(f"{Colors.GREEN}[STATUS]{Colors.END} Monitoramento finalizado")

if __name__ == "__main__":
    main()
