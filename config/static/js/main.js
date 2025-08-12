const { createGrid } = agGrid;

document.addEventListener('DOMContentLoaded', () => {
  // Elementos do DOM
  const gridDiv = document.getElementById('myGrid');
  const searchInput = document.getElementById('search-input');
  
  if (!gridDiv) {
    console.error('Elemento #myGrid não encontrado no DOM!');
    showError('Elemento do grid não encontrado');
    return;
  }

  // Variáveis de estado
  let gridApi;
  let rowData = [];
  let filteredData = [];
  let currentPage = 1;
  let pageSize = parseInt(document.getElementById('items-per-page').value) || 10;

  // Configuração das colunas
  const columnDefs = [
    { headerName: 'Ref Giant', field: 'ref_giant', sortable: true, filter: true },
    { headerName: 'MAWB', field: 'mawb', sortable: true, filter: true },
    { headerName: 'HAWB', field: 'hawb', sortable: true, filter: true },
    { headerName: 'Q', field: 'q', sortable: true, filter: true },
    { headerName: 'C3', field: 'c3', sortable: true, filter: true },
    { headerName: 'Delivery ID', field: 'deliveryid', sortable: true, filter: true },
    { headerName: 'Status', field: 'sostatus_releasedonholdreturned', sortable: true, filter: true },
    { headerName: 'Data Liberação', field: 'data_liberacao', sortable: true, filter: true },
    { headerName: 'CIPBRL', field: 'cipbrl', sortable: true, filter: true },
    { headerName: 'PC', field: 'pc', sortable: true, filter: true },
    { headerName: 'Peso', field: 'peso', sortable: true, filter: true },
    { headerName: 'Peso Cobrável', field: 'peso_cobravel', sortable: true, filter: true },
    { headerName: 'Tipo', field: 'tipo', sortable: true, filter: true },
    { headerName: 'PUPDT', field: 'pupdt', sortable: true, filter: true },
    { headerName: 'CIOK', field: 'ciok', sortable: true, filter: true },
    { headerName: 'Lientrydt', field: 'lientrydt', sortable: true, filter: true },
    { headerName: 'Liok', field: 'liok', sortable: true, filter: true },
    { headerName: 'Ok to Ship', field: 'ok_to_ship', sortable: true, filter: true },
    { headerName: 'LI', field: 'li', sortable: true, filter: true },
    { headerName: 'HAWBDT', field: 'hawbdt', sortable: true, filter: true },
    { headerName: 'Estimated Booking DT', field: 'estimatedbookingdt', sortable: true, filter: true },
    { headerName: 'Arrival Destination DT', field: 'arrivaldestinationdt', sortable: true, filter: true },
    { headerName: 'Solicitação Fundos', field: 'solicitacao_fundos', sortable: true, filter: true },
    { headerName: 'Fundos Recebidos', field: 'fundos_recebidos', sortable: true, filter: true },
    { headerName: 'EADIDT', field: 'eadidt', sortable: true, filter: true },
    { headerName: 'DIDUEDT', field: 'diduedt', sortable: true, filter: true },
    { headerName: 'DIDUENUMBER', field: 'diduenumber', sortable: true, filter: true },
    { headerName: 'ICMS Pago', field: 'icmspago', sortable: true, filter: true },
    { headerName: 'Canal Cor', field: 'canal_cor', sortable: true, filter: true },
    { headerName: 'Data Liberação CCR', field: 'data_liberacao_ccr', sortable: true, filter: true },
    { headerName: 'Data NFE', field: 'data_nfe', sortable: true, filter: true },
    { headerName: 'Número NFE', field: 'numero_nfe', sortable: true, filter: true },
    { headerName: 'NFTGDT', field: 'nftgdt', sortable: true, filter: true },
    { headerName: 'NFTG', field: 'nftg', sortable: true, filter: true },
    { headerName: 'DLVAT Destination', field: 'dlvatdestination', sortable: true, filter: true },
    { headerName: 'Status Impexp', field: 'status_impexp', sortable: true, filter: true },
    { headerName: 'Data Estimada', field: 'data_estimada', sortable: true, filter: true },
    { 
      headerName: 'Eventos', 
      field: 'eventos', 
      sortable: false, 
      filter: true, 
      wrapText: true,
      autoHeight: false,
      cellStyle: { 'white-space': 'normal', 'line-height': '1.5' }
    },
    { headerName: 'Real Lead Time', field: 'real_lead_time', sortable: true, filter: true },
    { headerName: 'Ship Failure Days', field: 'ship_failure_days', sortable: true, filter: true },
    { headerName: 'Tipo Justificativa Atraso', field: 'tipo_justificativa_atraso', sortable: true, filter: true },
    { headerName: 'Justificativa Atraso', field: 'justificativa_atraso', sortable: true, filter: true }
  ];

  const gridOptions = {
    columnDefs,
    rowData: [],
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
      wrapText: true,
      autoHeight: false
    },
    pagination: false,
    getRowHeight: () => 50,
    domLayout: 'autoHeight',
    onGridReady: (params) => {
      gridApi = params.api;
      loadData();
    }
  };

  // Cria o grid
  createGrid(gridDiv, gridOptions);

  // Função para atualizar o grid
  function updateGrid(dataToShow) {
    if (!gridApi) {
      console.error('Grid API não disponível');
      showError('Tabela não está pronta. Recarregue a página.');
      return;
    }

    try {
      const totalItems = dataToShow.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      currentPage = Math.max(1, Math.min(currentPage, totalPages));

      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      const pageItems = dataToShow.slice(start, end);

      gridApi.setRowData(pageItems);
      updatePaginationControls(totalItems, start, end, currentPage, totalPages);
    } catch (error) {
      console.error('Erro ao atualizar grid:', error);
      showError('Erro ao atualizar dados');
    }
  }

  // Função para carregar dados da API
  async function loadData() {
    try {
      showLoading(true);
      const response = await fetch('/api/dados/', {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (response.status === 403) {
        throw new Error('Acesso negado');
      }

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const data = await response.json();
      rowData = data;
      filteredData = [...data];
      updateGrid(filteredData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showError(error.message);
    } finally {
      showLoading(false);
    }
  }

  // Funções auxiliares
  function updatePaginationControls(totalItems, start, end, currentPage, totalPages) {
    const elements = {
      'showing-from': totalItems === 0 ? 0 : start + 1,
      'showing-to': Math.min(end, totalItems),
      'total-items': totalItems,
      'current-page': currentPage,
      'total-pages': totalPages
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  function showLoading(show) {
    const loader = document.getElementById('loading-indicator');
    if (loader) loader.style.display = show ? 'block' : 'none';
  }

  function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      setTimeout(() => errorElement.style.display = 'none', 5000);
    }
  }

  // Pesquisa com debounce
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const term = searchInput.value.trim().toLowerCase();
      filteredData = term ? rowData.filter(item => 
        Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(term)
        )
      ) : [...rowData];
      currentPage = 1;
      updateGrid(filteredData);
    }, 300);
  });

  // Paginação
  const paginationControls = {
    'first-page': () => currentPage = 1,
    'prev-page': () => currentPage > 1 && currentPage--,
    'next-page': () => {
      const totalPages = Math.ceil(filteredData.length / pageSize);
      if (currentPage < totalPages) currentPage++;
    },
    'last-page': () => currentPage = Math.ceil(filteredData.length / pageSize)
  };

  Object.entries(paginationControls).forEach(([id, action]) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('click', () => {
        action();
        updateGrid(filteredData);
      });
    }
  });

  // Itens por página
  const itemsPerPageSelect = document.getElementById('items-per-page');
  if (itemsPerPageSelect) {
    itemsPerPageSelect.addEventListener('change', (e) => {
      pageSize = parseInt(e.target.value);
      currentPage = 1;
      updateGrid(filteredData);
    });
  }
});