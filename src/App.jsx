import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import Home from "./pages/Home";
import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login";
import MinhaConta from "./pages/MinhaConta";
import {
  ClienteHome,
  PosTriagem,
  PsicologoHome,
} from "./pages/Portais";
import Triagem from "./pages/Triagem";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/minha-conta" element={<MinhaConta />} />

        <Route path="/triagem/concluida" element={<PosTriagem />} />
        <Route path="/cliente" element={<ClienteHome />} />
        <Route path="/psicologo" element={<PsicologoHome />} />
        <Route path="/triagem" element={<Triagem />} />

        <Route
          path="*"
          element={
            <main style={{ padding: "40px", textAlign: "center" }}>
              <h1>Página não encontrada</h1>
              <Link to="/">Voltar ao início</Link>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}