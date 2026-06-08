import { useEffect, useState } from "react";
import { listarUsuarios } from "../services/usuarios";

function Dashboard() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const dados = await listarUsuarios();
        setUsuarios(dados);
      } catch (erro) {
        console.error(erro);
      }
    }

    carregarUsuarios();
  }, []);

  return (
    <div className="container">
      <h1>Dashboard</h1>

      <h2>Usuários cadastrados</h2>

      {usuarios.length === 0 ? (
        <p>Nenhum usuário cadastrado.</p>
      ) : (
        usuarios.map((usuario) => (
          <div key={usuario.usuarioId}>
            <h3>{usuario.nome}</h3>
            <p>Email: {usuario.email}</p>
            <p>Idade: {usuario.idade}</p>
            <p>Altura: {usuario.altura} m</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;