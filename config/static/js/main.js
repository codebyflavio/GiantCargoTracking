// main.js (corrigido para usar UMD global do CDN)
const csrfToken =
  window.csrfToken ||
  document.querySelector("[name=csrfmiddlewaretoken]")?.value ||
  null;

document.addEventListener("DOMContentLoaded", () => {
  checkAuthentication();

  const gridDiv = document.getElementById("myGrid");
  const searchInput = document.getElementById("search-input");

  if (!gridDiv) {
    console.error("Elemento #myGrid não encontrado no DOM!");
    showError("Elemento do grid não encontrado");
    return;
  }

  let gridApi;
  let rowData = [];
  let filteredData = [];
  let currentPage = 1;
  let pageSize = Number.parseInt(document.getElementById("items-per-page").value) || 10;

  async function checkAuthentication() {
    try {
      const response = await fetch("/api/user-info/", {
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        window.location.href = "/login/";
        return;
      }

      const userData = await response.json();
      console.log("[v0] Usuário autenticado:", userData);
      updateUserInterface(userData);
    } catch (error) {
      console.error("[v0] Erro ao verificar autenticação:", error);
      window.location.href = "/login/";
    }
  }

  function updateUserInterface(userData) {
    const userElement = document.getElementById("current-user");
    if (userElement) userElement.textContent = userData.username;

    const roleElements = document.querySelectorAll(".user-role");
    roleElements.forEach((el) => (el.textContent = `(${userData.group})`));
  }

  // Campos editáveis
  const editableFields = [
    "q",
    "sostatus_releasedonholdreturned",
    "data_liberacao",
    "data_nfe",
    "numero_nfe",
    "nftgdt",
    "nftg",
    "dlvatdestination",
    "status_impexp",
    "eventos",
  ];

  // ... (mantive suas colDefs, gridOptions etc. exatamente como estavam)

  const allColumns = [
    // COLUNA PRINCIPAL (movida para primeira posição)
    { headerName: "REF. GIANT", field: "ref_giant", sortable: true, filter: true, minWidth: 140 },

    // Demais colunas na ordem original (com REF. GIANT removida da posição anterior)
    { headerName: "Q", field: "q", sortable: true, filter: true, minWidth: 80 },
    { headerName: "C3#", field: "c3", sortable: true, filter: true, minWidth: 80 },
    { headerName: "DELIVERY ID", field: "deliveryid", sortable: true, filter: true, minWidth: 140 },
    {
      headerName: "SO STATUS - RELEASED / ON HOLD / RETURNED",
      field: "sostatus_releasedonholdreturned",
      sortable: true,
      filter: true,
      minWidth: 220,
    },
    { headerName: "RELEASED DT", field: "data_liberacao", sortable: true, filter: true, minWidth: 150 },
    { headerName: "MAWB", field: "mawb", sortable: true, filter: true, minWidth: 120 },
    { headerName: "HAWB", field: "hawb", sortable: true, filter: true, minWidth: 120 },
    { headerName: "CIP BRL", field: "cipbrl", sortable: true, filter: true, minWidth: 120 },
    { headerName: "PC", field: "pc", sortable: true, filter: true, minWidth: 80 },
    { headerName: "GROSS WEIGHT", field: "peso", sortable: true, filter: true, minWidth: 120 },
    { headerName: "CHARGEABLE WEIGHT", field: "peso_cobravel", sortable: true, filter: true, minWidth: 150 },
    { headerName: "TYPE", field: "tipo", sortable: true, filter: true, minWidth: 100 },
    { headerName: "P/UP DT", field: "pupdt", sortable: true, filter: true, minWidth: 120 },
    { headerName: "CI OK", field: "ciok", sortable: true, filter: true, minWidth: 100 },
    { headerName: "LI ENTRY DT", field: "lientrydt", sortable: true, filter: true, minWidth: 140 },
    { headerName: "LI OK", field: "liok", sortable: true, filter: true, minWidth: 100 },
    { headerName: "OK TO SHIP", field: "ok_to_ship", sortable: true, filter: true, minWidth: 140 },
    { headerName: "LI", field: "li", sortable: true, filter: true, minWidth: 80 },
    { headerName: "HAWB DT", field: "hawbdt", sortable: true, filter: true, minWidth: 120 },
    { headerName: "ESTIMATED BOOKING DT", field: "estimatedbookingdt", sortable: true, filter: true, minWidth: 180 },
    {
      headerName: "ARRIVAL DESTINATION DT",
      field: "arrivaldestinationdt",
      sortable: true,
      filter: true,
      minWidth: 200,
    },
    { headerName: "FUNDS REQUEST", field: "solicitacao_fundos", sortable: true, filter: true, minWidth: 180 },
    { headerName: "FUNDS RECEIVED", field: "fundos_recebidos", sortable: true, filter: true, minWidth: 180 },
    { headerName: "EADI DT", field: "eadidt", sortable: true, filter: true, minWidth: 120 },
    { headerName: "DI / DUE DT", field: "diduedt", sortable: true, filter: true, minWidth: 140 },
    { headerName: "DI / DUE NUMBER", field: "diduenumber", sortable: true, filter: true, minWidth: 150 },
    { headerName: "ICMS PAID", field: "icmspago", sortable: true, filter: true, minWidth: 140 },
    { headerName: "CHANNEL COLOR", field: "canal_cor", sortable: true, filter: true, minWidth: 120 },
    { headerName: "CC RLSD DT", field: "data_liberacao_ccr", sortable: true, filter: true, minWidth: 180 },
    { headerName: "NFE DT", field: "data_nfe", sortable: true, filter: true, minWidth: 120 },
    { headerName: "NFE", field: "numero_nfe", sortable: true, filter: true, minWidth: 140 },
    { headerName: "NFTG DT", field: "nftgdt", sortable: true, filter: true, minWidth: 120 },
    { headerName: "NFTG", field: "nftg", sortable: true, filter: true, minWidth: 100 },
    { headerName: "DLV AT DESTINATION", field: "dlvatdestination", sortable: true, filter: true, minWidth: 180 },
    { headerName: "Status IMP/EXP", field: "status_impexp", sortable: true, filter: true, minWidth: 150 },
    { headerName: "EVENT", field: "eventos", sortable: false, filter: true, minWidth: 200 },
    { headerName: "REAL LEAD TIME", field: "real_lead_time", sortable: true, filter: true, minWidth: 160 },
    { headerName: "SHIP FAILURE DAYS", field: "ship_failure_days", sortable: true, filter: true, minWidth: 180 },
    { headerName: "TYPE", field: "tipo_justificativa_atraso", sortable: true, filter: true, minWidth: 220 },
    { headerName: "FAILURE JUSTIFICATION", field: "justificativa_atraso", sortable: true, filter: true, minWidth: 200 }
  ];

  // TRAVAR VISIBILIDADE DA PRIMEIRA COLUNA (nunca será permitida a ocultação via UI)
  if (allColumns.length > 0) {
    allColumns[0].lockVisible = true; // REF. GIANT ficará sempre visível
  }

  const editableColumns = [];
  const nonEditableColumns = [];

  allColumns.forEach((col) => {
    if (editableFields.includes(col.field)) {
      col.editable = true;
      col.headerClass = "editable-header";
      editableColumns.push(col);
    } else {
      nonEditableColumns.push(col);
    }
  });

  const columnDefs = [...nonEditableColumns, ...editableColumns];

  const gridOptions = {
    columnDefs,
    rowData: [],
    autoHeaderHeight: true,
    suppressMenuHide: true,

    // <<== CORREÇÃO PRINCIPAL: evita que colunas sejam escondidas ao arrastar pra fora do grid
    suppressDragLeaveHidesColumns: true,

    onGridSizeChanged: (params) => {
      try {
        params.api.sizeColumnsToFit();
      } catch (e) {
        console.error("Erro no onGridSizeChanged:", e);
      }
    },

    // Listen para eventos úteis e logging (ajuda no debug)
    onGridReady: (params) => {
      gridApi = params.api;
      console.log("Grid pronto — inicializando dados...");
      loadData();
      setTimeout(() => {
        try {
          params.api.sizeColumnsToFit();
          params.api.resetRowHeights();
        } catch (e) {
          console.error("Erro ao ajustar colunas/rows após load:", e);
        }
      }, 100);
    },

    // Se o usuário acidentalmente ocultar alguma coluna (por outra via), restaura automaticamente.
    // Isso serve como "seguro extra" — você pode remover se quiser permitir ocultação manual.
    onColumnVisible: (params) => {
      try {
        const colId = params.column.getColId();
        if (params.visible === false) {
          console.warn(`Coluna "${colId}" ficou invisível — restaurando automaticamente.`);
          // pequeno timeout para garantir que outras ações do ag-Grid terminem
          setTimeout(() => {
            try {
              params.columnApi.setColumnVisible(colId, true);
            } catch (err) {
              console.error("Falha ao restaurar visibilidade da coluna:", err);
            }
          }, 50);
        }
      } catch (err) {
        console.error("Erro no onColumnVisible:", err);
      }
    },

    // Mantém comportamento anterior de edição/atualização
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 100,
      wrapText: true,
      autoHeight: false,
      wrapHeaderText: true,
      autoHeaderHeight: true,
    },
    pagination: false,
    getRowHeight: () => 50,
    domLayout: "autoHeight",
    onCellValueChanged: async (event) => {
      const { data, colDef, newValue, oldValue } = event;
      if (newValue === oldValue) return;

      try {
        const response = await fetch(`/api/dados/${data.id}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ [colDef.field]: newValue }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          showError(`Erro ao atualizar: ${JSON.stringify(errorData)}`);
          event.node.setDataValue(colDef.field, oldValue);
        }
      } catch (err) {
        console.error(err);
        showError("Erro de conexão ao atualizar");
        event.node.setDataValue(colDef.field, oldValue);
      }
    },
  };

  // usa o global agGrid (CDN UMD)
  agGrid.createGrid(gridDiv, gridOptions);

  async function loadData() {
    try {
      showLoading(true);
      const response = await fetch("/api/dados/", {
        credentials: "include",
        headers: { Accept: "application/json" },
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
      "showing-from": totalItems === 0 ? 0 : start + 1,
      "showing-to": Math.min(end, totalItems),
      "total-items": totalItems,
      "current-page": currentPage,
      "total-pages": totalPages,
    };
    Object.entries(elements).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }

  function showLoading(show) {
    const loader = document.getElementById("loading-indicator");
    if (loader) loader.style.display = show ? "block" : "none";
  }

  function showError(msg) {
    const el = document.getElementById("error-message");
    if (el) {
      el.textContent = msg;
      el.style.display = "block";
      setTimeout(() => (el.style.display = "none"), 5000);
    }
  }

  let searchTimeout;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const term = searchInput.value.trim().toLowerCase();
      filteredData = term
        ? rowData.filter((item) =>
            Object.values(item).some((val) => val && val.toString().toLowerCase().includes(term)),
          )
        : [...rowData];
      currentPage = 1;
      updateGrid(filteredData);
    }, 300);
  });

  const paginationControls = {
    "first-page": () => (currentPage = 1),
    "prev-page": () => currentPage > 1 && currentPage--,
    "next-page": () => {
      const totalPages = Math.ceil(filteredData.length / pageSize);
      if (currentPage < totalPages) currentPage++;
    },
    "last-page": () => (currentPage = Math.ceil(filteredData.length / pageSize)),
  };

  Object.entries(paginationControls).forEach(([id, action]) => {
    const el = document.getElementById(id);
    if (el)
      el.addEventListener("click", () => {
        action();
        updateGrid(filteredData);
      });
  });

  const itemsPerPageSelect = document.getElementById("items-per-page");
  if (itemsPerPageSelect) {
    itemsPerPageSelect.addEventListener("change", (e) => {
      pageSize = Number.parseInt(e.target.value);
      currentPage = 1;
      updateGrid(filteredData);
    });
  }
});
