import API_URL from "./api";

export const listarMetricas = (usuarioId) =>
  fetch(`${API_URL}/usuarios/${usuarioId}/metricas`)
    .then(r => r.json());

export const criarMetrica = (usuarioId, metrica) =>
  fetch(`${API_URL}/usuarios/${usuarioId}/metricas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metrica)
  }).then(r => r.json());

export const atualizarMetrica = (id, metrica) =>
  fetch(`${API_URL}/metricas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metrica)
  }).then(r => r.json());

export const deletarMetrica = (id) =>
  fetch(`${API_URL}/metricas/${id}`, {
    method: "DELETE"
  });