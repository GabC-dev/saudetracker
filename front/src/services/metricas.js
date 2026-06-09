const BASE = "http://localhost:8080"
 
export const listarMetricas = (usuarioId) =>
  fetch(`${BASE}/usuarios/${usuarioId}/metricas`).then(r => r.json())
 
export const criarMetrica = (usuarioId, metrica) =>
  fetch(`${BASE}/usuarios/${usuarioId}/metricas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metrica)
  }).then(r => r.json())