import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Cadastro from "./pages/Cadastro";
import RegistrarMetrica from "./pages/RegistrarMetrica";
import Historico from "./pages/Historico";
import Alertas from "./pages/Alertas";

import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/registrar" element={<RegistrarMetrica />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/alertas" element={<Alertas />} />
      </Routes>
    </>
  );
}

export default App;