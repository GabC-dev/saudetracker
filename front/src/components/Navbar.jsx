import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h2>SaudeTracker</h2>

      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/cadastro">Usuário</Link>
        <Link to="/registrar">Registrar</Link>
        <Link to="/historico">Histórico</Link>
        <Link to="/alertas">Alertas</Link>
      </div>
    </nav>
  );
}

export default Navbar;