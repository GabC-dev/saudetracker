import API_URL from "./api";

export const listarUsuarios = () =>
  fetch(`${API_URL}/usuarios`).then(r => r.json());

export const buscarUsuario = (id) =>
  fetch(`${API_URL}/usuarios/${id}`).then(r => r.json());

export const criarUsuario = (usuario) =>
  fetch(`${API_URL}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario)
  }).then(r => r.json());

export const atualizarUsuario = (id, usuario) =>
  fetch(`${API_URL}/usuarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario)
  }).then(r => r.json());

export const deletarUsuario = (id) =>
  fetch(`${API_URL}/usuarios/${id}`, {
    method: "DELETE"
  });