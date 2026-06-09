const BASE = "http://localhost:8080";

export const listarUsuarios = () =>
  fetch(`${BASE}/usuarios`).then(r => r.json());

export const buscarUsuario = (id) =>
  fetch(`${BASE}/usuarios/${id}`).then(r => r.json());

export const criarUsuario = (usuario) =>
  fetch(`${BASE}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario)
  }).then(r => r.json());

export const atualizarUsuario = (id, usuario) =>
  fetch(`${BASE}/usuarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario)
  }).then(r => r.json());

export const deletarUsuario = (id) =>
  fetch(`${BASE}/usuarios/${id}`, {
    method: "DELETE"
  });