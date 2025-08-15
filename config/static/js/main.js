import { createGrid } from "./gridSetup.js"
import { fetchData, showError, showLoading } from "./utils.js"
import { updateGrid, changePageSize, goToFirstPage, goToPrevPage, goToNextPage, goToLastPage } from "./pagination.js"
import { checkAuthentication } from "./auth.js"
import { setupSearch } from "./search.js"

// Função principal encapsulada
async function initializeApp() {
  try {
    const isAuthenticated = await checkAuthentication()
    if (!isAuthenticated) {
      console.log("Redirecionando para login...")
      window.location.href = "/login/"
      return // Parar execução aqui
    }

    const gridDiv = document.getElementById("myGrid")
    if (!gridDiv) {
      throw new Error("Elemento do grid não encontrado")
    }

    // Criar grid
    createGrid(gridDiv)

    const itemsPerPageSelect = document.getElementById("items-per-page")
    if (itemsPerPageSelect) {
      itemsPerPageSelect.addEventListener("change", (e) => {
        changePageSize(e.target.value)
      })
    }

    const firstPageBtn = document.getElementById("first-page")
    const prevPageBtn = document.getElementById("prev-page")
    const nextPageBtn = document.getElementById("next-page")
    const lastPageBtn = document.getElementById("last-page")

    if (firstPageBtn) firstPageBtn.addEventListener("click", goToFirstPage)
    if (prevPageBtn) prevPageBtn.addEventListener("click", goToPrevPage)
    if (nextPageBtn) nextPageBtn.addEventListener("click", goToNextPage)
    if (lastPageBtn) lastPageBtn.addEventListener("click", goToLastPage)

    // Carregar dados
    showLoading(true)

    try {
      const data = await fetchData("/api/dados/")
      updateGrid(data)
      setupSearch(data, updateGrid)
    } catch (err) {
      console.error("Erro ao carregar dados:", err)
      showError(`Falha ao carregar dados: ${err.message}`)
    } finally {
      showLoading(false)
    }
  } catch (error) {
    console.error("Erro na inicialização:", error)
    showError(`Erro na aplicação: ${error.message}`)
  }
}

// Iniciar aplicação quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", initializeApp)
