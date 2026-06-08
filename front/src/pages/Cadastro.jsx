import { useState } from "react";
import { criarUsuario } from "../services/usuarios";

function Cadastro() {
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [altura, setAltura] = useState("");
  const [email, setEmail] = useState("");

  async function salvarUsuario(e) {
    e.preventDefault();

    try {
      const usuario = {
        usuarioId: 0,
        nome,
        idade: Number(idade),
        altura: Number(altura),
        email,
      };

      const resultado = await criarUsuario(usuario);

      console.log(resultado);

      alert("Usuário cadastrado com sucesso!");

      setNome("");
      setIdade("");
      setAltura("");
      setEmail("");
    } catch (erro) {
      console.error(erro);
      alert("Erro ao cadastrar usuário");
    }
  }

  return (
    <div className="container">
      <h1>Cadastro de Usuário</h1>

      <form onSubmit={salvarUsuario}>
        <div>
          <label>Nome</label>
          <br />
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div>
          <label>Idade</label>
          <br />
          <input
            type="number"
            value={idade}
            onChange={(e) => setIdade(e.target.value)}
          />
        </div>

        <div>
          <label>Altura</label>
          <br />
          <input
            type="number"
            step="0.01"
            value={altura}
            onChange={(e) => setAltura(e.target.value)}
          />
        </div>

        <div>
          <label>Email</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <br />

        <button type="submit">
          Salvar
        </button>
      </form>
    </div>
  );
}

export default Cadastro;