import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login";
import LoginPsicologo from "./pages/LoginPsicologo";
import MinhaConta from "./pages/MinhaConta";
import Triagem from "./pages/Triagem";
import TriagemPerguntas from "./pages/TriagemPerguntas";
import TriagemResumo from "./pages/TriagemResumo";
import { PosTriagem } from "./pages/Portais";
import ClienteHome from "./pages/cliente/ClienteHome";
import PsicologoHome from "./pages/psicologo/PsicologoHome";
import CadastroPsicologo from "./pages/CadastroPsicologo";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/minha-conta" element={<MinhaConta />} />
        <Route path="/cliente" element={<ClienteHome />} />

        <Route path="/login/psicologo" element={<LoginPsicologo />} />
        <Route path="/psicologo" element={<PsicologoHome />} />

        <Route path="/triagem" element={<Triagem />} />
        <Route path="/triagem/perguntas" element={<TriagemPerguntas />} />
        <Route path="/triagem/resumo" element={<TriagemResumo />} />
        <Route path="/triagem/concluida" element={<PosTriagem />} />
        <Route path="/cadastro" element={<Cadastro />} />

<Route
  path="/cadastro/psicologo"
  element={<CadastroPsicologo />}
/>

        <Route
          path="*"
          element={
            <main style={{ padding: "60px 24px", textAlign: "center" }}>
              <h1>Página não encontrada</h1>
              <Link to="/">Voltar ao início</Link>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}