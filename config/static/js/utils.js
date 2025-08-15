export const csrfToken = (() => {
  // Tentar obter do meta tag primeiro
  const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")
  if (metaToken) return metaToken

  // Fallback para input hidden
  const inputToken = document.querySelector("[name=csrfmiddlewaretoken]")?.value
  if (inputToken) return inputToken

  // Fallback para variável global do template Django
  if (typeof window.csrfToken !== "undefined") return window.csrfToken

  console.warn("CSRF token não encontrado")
  return ""
})()

// Variáveis e funções utilitárias
export const editableFields = [
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
]

// Adicione isto ao seu utils.js existente
export async function saveEditToBackend(id, field, newValue) {
  try {
    const response = await fetch(`/api/update-item/${id}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({
        field,
        value: newValue,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Erro ao salvar edição:", error)
    throw error
  }
}

export async function fetchData(url) {
  try {
    const response = await fetch(url, {
      credentials: "include",
      headers: {
        Accept: "application/json",
        "X-CSRFToken": csrfToken,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Erro ao buscar dados:", error)
    throw error
  }
}

export function showError(message) {
  const errorElement = document.getElementById("error-message")
  if (errorElement) {
    errorElement.textContent = message
    errorElement.style.display = "block"
    setTimeout(() => {
      errorElement.style.display = "none"
    }, 5000)
  }
}

export function showLoading(show) {
  const loadingElement = document.getElementById("loading-indicator")
  if (loadingElement) {
    loadingElement.style.display = show ? "block" : "none"
  }
}
