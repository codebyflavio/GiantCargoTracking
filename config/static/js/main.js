const { createGrid } = agGrid;

document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.getElementById('myGrid');
  const searchInput = document.getElementById('search-input');
  
  if (!gridDiv) {
    console.error('Elemento #myGrid não encontrado no DOM!');
    showError('Elemento do grid não encontrado');
    return;
  }

  let gridApi;
  let rowData = [];
  let filteredData = [];
  let currentPage = 1;
  let pageSize = parseInt(document.getElementById('items-per-page').value) || 10;

  // Campos editáveis
  const editableFields = [
    'q', 'sostatus_releasedonholdreturned', 'data_liberacao',
    'data_nfe', 'numero_nfe', 'nftgdt', 'nftg',
    'dlvatdestination', 'status_impexp', 'eventos'
  ];

  // Todas as colunas
  const allColumns = [
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
    { headerName: 'Eventos', field: 'eventos', sortable: false, filter: true },
    { headerName: 'Real Lead Time', field: 'real_lead_time', sortable: true, filter: true },
    { headerName: 'Ship Failure Days', field: 'ship_failure_days', sortable: true, filter: true },
    { headerName: 'Tipo Justificativa Atraso', field: 'tipo_justificativa_atraso', sortable: true, filter: true },
    { headerName: 'Justificativa Atraso', field: 'justificativa_atraso', sortable: true, filter: true }
  ];

  // Separar colunas
  const editableColumns = [];
  const nonEditableColumns = [];

  allColumns.forEach(col => {
    if (editableFields.includes(col.field)) {
      col.editable = true;
      col.headerClass = 'editable-header';
      editableColumns.push(col);
    } else {
      nonEditableColumns.push(col);
    }
  });

  const columnDefs = [...nonEditableColumns, ...editableColumns];

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
    },
    onCellValueChanged: async (event) => {
      const { data, colDef, newValue, oldValue } = event;
      if (newValue === oldValue) return;

      try {
        const response = await fetch(`/api/dados/${data.id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          },
          body: JSON.stringify({ [colDef.field]: newValue })
        });

        if (!response.ok) {
          const errorData = await response.json();
          showError(`Erro ao atualizar: ${JSON.stringify(errorData)}`);
          event.node.setDataValue(colDef.field, oldValue); // reverte
        }
      } catch (err) {
        console.error(err);
        showError('Erro de conexão ao atualizar');
        event.node.setDataValue(colDef.field, oldValue); // reverte
      }
    }
  };

  createGrid(gridDiv, gridOptions);

  async function loadData() {
    try {
      showLoading(true);
      const response = await fetch('/api/dados/', {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error(`Erro ${response.status}`);

      rowData = await response.json();
      filteredData = [...rowData];
      updateGrid(filteredData);
    } catch (err) {
      console.error(err);
      showError(err.message);
    } finally {
      showLoading(false);
    }
  }

  function updateGrid(dataToShow) {
    if (!gridApi) return;
    const totalItems = dataToShow.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = dataToShow.slice(start, end);
    gridApi.setRowData(pageItems);
    updatePaginationControls(totalItems, start, end, currentPage, totalPages);
  }

  function updatePaginationControls(totalItems, start, end, currentPage, totalPages) {
    const elements = {
      'showing-from': totalItems === 0 ? 0 : start + 1,
      'showing-to': Math.min(end, totalItems),
      'total-items': totalItems,
      'current-page': currentPage,
      'total-pages': totalPages
    };
    Object.entries(elements).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }

  function showLoading(show) {
    const loader = document.getElementById('loading-indicator');
    if (loader) loader.style.display = show ? 'block' : 'none';
  }

  function showError(msg) {
    const el = document.getElementById('error-message');
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
      setTimeout(() => el.style.display = 'none', 5000);
    }
  }

  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const term = searchInput.value.trim().toLowerCase();
      filteredData = term
        ? rowData.filter(item =>
            Object.values(item).some(val => val && val.toString().toLowerCase().includes(term))
          )
        : [...rowData];
      currentPage = 1;
      updateGrid(filteredData);
    }, 300);
  });

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
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => { action(); updateGrid(filteredData); });
  });

  const itemsPerPageSelect = document.getElementById('items-per-page');
  if (itemsPerPageSelect) {
    itemsPerPageSelect.addEventListener('change', (e) => {
      pageSize = parseInt(e.target.value);
      currentPage = 1;
      updateGrid(filteredData);
    });
  }
});
