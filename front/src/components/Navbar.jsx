import { NavLink } from 'react-router-dom'
 
export default function Navbar({ iniciais = 'GC' }) {
  return (
    <nav className="navbar">
 
      <NavLink to="/" className="navbar-brand">
        <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 24s-9-5.5-9-12a6 6 0 0 1 9-5.2A6 6 0 0 1 23 12c0 6.5-9 12-9 12z"
            fill="#2ecc71" stroke="#1aab58" strokeWidth="1.5"/>
          <polyline points="9,14 12,17 16,11 19,14"
            stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
        Saúde Tracker
      </NavLink>
 
      <ul className="navbar-links">
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            Início
          </NavLink>
        </li>
        <li>
          <NavLink to="/cadastro" className={({ isActive }) => isActive ? 'active' : ''}>
            Cadastro
          </NavLink>
        </li>
        <li>
          <NavLink to="/registrar" className={({ isActive }) => isActive ? 'active' : ''}>
            Registrar
          </NavLink>
        </li>
        <li>
          <NavLink to="/historico" className={({ isActive }) => isActive ? 'active' : ''}>
            Histórico 
          </NavLink>
        </li>
        <li>
          <NavLink to="/alertas" className={({ isActive }) => isActive ? 'active' : ''}>
            Alertas
          </NavLink>
        </li>
      </ul>
 
  
 
    </nav>
  )
}
 