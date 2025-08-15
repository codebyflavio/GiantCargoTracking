import { columnDefs } from "./gridColumns.js"
import { saveEditToBackend } from "./utils.js"

// Módulo singleton para gerenciar estado do grid
const GridManager = (() => {
  let gridApi = null
  let columnApi = null
  let allData = []
  let filteredData = null

  return {
    createGrid: function (gridDiv, rowData = []) {
      if (!gridDiv) return null

      if (typeof window.agGrid === "undefined") {
        console.error("ag-Grid não está carregado. Verifique se o script CDN está incluído.")
        return null
      }

      allData = rowData

      const gridOptions = {
        columnDefs,
        rowData,
        defaultColDef: {
          sortable: true,
          filter: true,
          resizable: true,
        },
        animateRows: true,
        rowSelection: "single",
        onGridReady: (params) => {
          gridApi = params.api
          columnApi = params.columnApi
        },
        onCellValueChanged: (params) => {
          this.handleCellEdit(params)
        },
      }

      new window.agGrid.Grid(gridDiv, gridOptions)
      return gridOptions
    },

    handleCellEdit: async (params) => {
      const { data, colDef, newValue } = params

      try {
        // Atualizar nos dados originais
        const originalItemIndex = allData.findIndex((item) => item.id === data.id)
        if (originalItemIndex >= 0) {
          allData[originalItemIndex][colDef.field] = newValue
        }

        // Enviar para o backend
        await saveEditToBackend(data.id, colDef.field, newValue)
      } catch (error) {
        console.error("Erro ao salvar edição:", error)
        // Reverter a mudança na UI se falhar
        if (gridApi) {
          gridApi.applyTransaction({ update: [data] })
        }
      }
    },

    getGridApi: () => gridApi,

    getColumnApi: () => columnApi,

    getAllData: () => allData,

    setAllData: (newData) => {
      allData = newData
    },

    getFilteredData: () => filteredData,

    setFilteredData: (data) => {
      filteredData = data
    },
  }
})()

// Exportar apenas as funções necessárias
export const { createGrid, getGridApi, getColumnApi, getAllData, setAllData, getFilteredData, setFilteredData } =
  GridManager
