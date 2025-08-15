import { getGridApi, getAllData, setAllData, getFilteredData, setFilteredData } from "./gridSetup.js"

export { setFilteredData }

// Módulo de paginação como IIFE (Immediately Invoked Function Expression)
const PaginationModule = (() => {
  // Estado interno da paginação
  let currentPage = 1
  let pageSize = 10
  let totalItems = 0

  // Função para aplicar a paginação
  const applyPagination = () => {
    const api = getGridApi()
    if (!api) return

    const currentData = getFilteredData() || getAllData()
    totalItems = currentData.length

    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedData = currentData.slice(startIndex, endIndex)

    api.setRowData(paginatedData)
  }

  // Função para atualizar a UI da paginação
  const updatePaginationUI = () => {
    const currentData = getFilteredData() || getAllData()
    const totalPages = Math.ceil(currentData.length / pageSize)
    const startItem = currentData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, currentData.length)

    // Atualizar elementos da UI
    const showingFrom = document.getElementById("showing-from")
    const showingTo = document.getElementById("showing-to")
    const totalItemsEl = document.getElementById("total-items")
    const currentPageEl = document.getElementById("current-page")
    const totalPagesEl = document.getElementById("total-pages")

    if (showingFrom) showingFrom.textContent = startItem
    if (showingTo) showingTo.textContent = endItem
    if (totalItemsEl) totalItemsEl.textContent = currentData.length
    if (currentPageEl) currentPageEl.textContent = currentPage
    if (totalPagesEl) totalPagesEl.textContent = totalPages

    // Habilitar/desabilitar botões
    const firstPageBtn = document.getElementById("first-page")
    const prevPageBtn = document.getElementById("prev-page")
    const nextPageBtn = document.getElementById("next-page")
    const lastPageBtn = document.getElementById("last-page")

    if (firstPageBtn) firstPageBtn.disabled = currentPage === 1
    if (prevPageBtn) prevPageBtn.disabled = currentPage === 1
    if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages
    if (lastPageBtn) lastPageBtn.disabled = currentPage >= totalPages
  }

  // Interface pública do módulo
  return {
    updateGrid: (newRowData) => {
      setAllData(newRowData)
      setFilteredData(null) // Resetar dados filtrados
      currentPage = 1 // Voltar para a primeira página
      applyPagination()
      updatePaginationUI()
    },

    changePageSize: (size) => {
      pageSize = Number.parseInt(size)
      currentPage = 1
      applyPagination()
      updatePaginationUI()
    },

    goToPage: (page) => {
      const currentData = getFilteredData() || getAllData()
      const totalPages = Math.ceil(currentData.length / pageSize)

      if (page < 1) page = 1
      if (page > totalPages) page = totalPages

      currentPage = page
      applyPagination()
      updatePaginationUI()
    },

    goToFirstPage: () => {
      PaginationModule.goToPage(1)
    },
    goToPrevPage: () => {
      PaginationModule.goToPage(currentPage - 1)
    },
    goToNextPage: () => {
      PaginationModule.goToPage(currentPage + 1)
    },
    goToLastPage: () => {
      const currentData = getFilteredData() || getAllData()
      PaginationModule.goToPage(Math.ceil(currentData.length / pageSize))
    },
  }
})()

// Exportar apenas a interface pública
export const { updateGrid, changePageSize, goToPage, goToFirstPage, goToPrevPage, goToNextPage, goToLastPage } =
  PaginationModule
