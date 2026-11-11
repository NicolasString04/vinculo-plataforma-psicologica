import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import Home from "./pages/Home";
import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login";
import LoginPsicologo from "./pages/LoginPsicologo";
import MinhaConta from "./pages/MinhaConta";
import Triagem from "./pages/Triagem";

import TriagemPerguntas from "./pages/TriagemPerguntas";
import TriagemResumo from "./pages/TriagemResumo";

import {
  ClienteHome,
  PosTriagem,
  PsicologoHome,
} from "./pages/Portais";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página inicial */}
        <Route path="/" element={<Home />} />

        {/* Área do paciente */}
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/minha-conta" element={<MinhaConta />} />

        {/* Área do psicólogo */}
        <Route
          path="/login/psicologo"
          element={<LoginPsicologo />}
        />

        <Route
          path="/psicologo"
          element={<PsicologoHome />}
        />

        {/* Triagem */}
        <Route path="/triagem" element={<Triagem />} />

        <Route
          path="/triagem/perguntas"
          element={<TriagemPerguntas />}
        />

        <Route
          path="/triagem/resumo"
          element={<TriagemResumo />}
        />

        <Route
          path="/triagem/concluida"
          element={<PosTriagem />}
        />

        {/* Portal do paciente */}
        <Route
          path="/cliente"
          element={<ClienteHome />}
        />

        {/* Página não encontrada */}
        <Route
          path="*"
          element={
            <main
              style={{
                padding: "60px 24px",
                textAlign: "center",
              }}
            >
              <h1>Página não encontrada</h1>
              <Link to="/">Voltar ao início</Link>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}