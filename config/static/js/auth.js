export async function checkAuthentication() {
  try {
    const response = await fetch("/api/user-info/", {
      credentials: "include",
      headers: { Accept: "application/json" },
    })

    if (!response.ok) {
      console.log("Usuário não autenticado, redirecionando...")
      return false
    }

    const userData = await response.json()
    console.log("Usuário autenticado:", userData)
    updateUserInterface(userData)
    return true
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error)
    return false
  }
}

function updateUserInterface(userData) {
  const userElement = document.getElementById("current-user")
  if (userElement) userElement.textContent = userData.username

  const roleElements = document.querySelectorAll(".user-role")
  roleElements.forEach((el) => (el.textContent = `(${userData.group})`))
}
