import { setFilteredData } from "./pagination.js"

export function setupSearch(initialData, onUpdate) {
  const searchInput = document.getElementById("search-input")
  if (!searchInput) return

  let searchTimeout

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      const term = searchInput.value.trim().toLowerCase()

      if (!term) {
        setFilteredData(null) // Remove o filtro
        onUpdate(initialData)
        return
      }

      const filteredData = initialData.filter((item) =>
        Object.values(item).some((val) => val && val.toString().toLowerCase().includes(term)),
      )

      setFilteredData(filteredData)
      onUpdate(filteredData)
    }, 300)
  })
}
