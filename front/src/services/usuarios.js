import API_URL from "./api";

export async function listarUsuarios() {
  const response = await fetch(`${API_URL}/usuarios`);

  if (!response.ok) {
    throw new Error("Erro ao buscar usuários");
  }

  return await response.json();
}

export async function criarUsuario(usuario) {
  const response = await fetch(`${API_URL}/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(usuario),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar usuário");
  }

  return await response.json();
}