import API_URL from "./api";

export async function listarAlertas(idUsuario) {
  const response = await fetch(
    `${API_URL}/usuarios/${idUsuario}/alertas`
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar alertas");
  }

  return await response.json();
}

export async function deletarAlerta(idAlerta) {
  const response = await fetch(
    `${API_URL}/alertas/${idAlerta}`,
    {
      method: "DELETE"
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao excluir alerta");
  }
}