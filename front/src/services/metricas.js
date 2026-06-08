import API_URL from "./api";

export async function listarMetricas(idUsuario) {
  const response = await fetch(
    `${API_URL}/usuarios/${idUsuario}/metricas`
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar métricas");
  }

  return await response.json();
}

export async function criarMetrica(idUsuario, metrica) {
  const response = await fetch(
    `${API_URL}/usuarios/${idUsuario}/metricas`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metrica),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao cadastrar métrica");
  }

  return await response.json();
}