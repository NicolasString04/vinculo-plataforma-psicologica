
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from "firebase/auth";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";

import { auth, db } from "../firebase";
import { requisitosSenha } from "./RequisitosSenha";
import "./MinhaConta.css";

// =====================================================
// CONFIGURAÇÕES
// =====================================================

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF",
  "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS",
  "RO", "RR", "SC", "SP", "SE", "TO",
];

const CAMPOS_VAZIOS = {
  nome: "",
  telefone: "",
  nascimento: "",
  cidade: "",
  uf: "",
};

const PREFS_VAZIAS = {
  avisosEmail: false,
  lembretesAtendimento: false,
  conteudosBemEstar: false,
};

// =====================================================
// ÍCONES
// =====================================================

function Icone({ nome, tamanho = 21 }) {
  const icones = {
    inicio: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v12h14V9M9 21v-7h6v7" />
      </>
    ),

    busca: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 5 5" />
      </>
    ),

    calendario: (
      <>
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="2"
        />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    ),

    coracao: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l7.8-7.5a5.5 5.5 0 0 0 0-7.8Z" />
    ),

    usuario: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),

    sino: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),

    escudo: (
      <>
        <path d="M12 2 20 5v6c0 5-3.2 8.3-8 11-4.8-2.7-8-6-8-11V5l8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),

    engrenagem: (
      <>
        <path d="M10 3h4l.7 2.2 2.1 1.2 2.3-.5 2 3.5-1.7 1.7v2.4l1.7 1.7-2 3.5-2.3-.5-2.1 1.2L14 22h-4l-.7-2.2-2.1-1.2-2.3.5-2-3.5 1.7-1.7v-2.4L2.9 9.8l2-3.5 2.3.5 2.1-1.2L10 3Z" />
        <circle cx="12" cy="12.5" r="3" />
      </>
    ),

    cartao: (
      <>
        <rect
          x="2"
          y="5"
          width="20"
          height="14"
          rx="3"
        />
        <path d="M2 10h20" />
      </>
    ),

    sair: (
      <>
        <path d="m10 17 5-5-5-5M15 12H3" />
        <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
      </>
    ),

    camera: (
      <>
        <path d="M3 7h4l2-3h6l2 3h4v13H3V7Z" />
        <circle cx="12" cy="13" r="4" />
      </>
    ),

    cadeado: (
      <>
        <rect
          x="5"
          y="10"
          width="14"
          height="11"
          rx="2"
        />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),

    monitor: (
      <>
        <rect
          x="3"
          y="4"
          width="18"
          height="15"
          rx="2"
        />
        <path d="M8 22h8M12 19v3" />
      </>
    ),

    envelope: (
      <>
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
        />
        <path d="m3 7 9 6 9-6" />
      </>
    ),

    check: <path d="m5 12 4 4L19 6" />,

    informacao: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6m0-10h.01" />
      </>
    ),

    menu: (
      <path d="M4 6h16M4 12h16M4 18h16" />
    ),

    imagem: (
      <>
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="3"
        />
        <circle cx="8" cy="8" r="2" />
        <path d="m4 18 5-5 3 3 3-4 5 6" />
      </>
    ),
  };

  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icones[nome]}
    </svg>
  );
}

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

const numeros = (valor) =>
  String(valor || "").replace(/\D/g, "");

function formatarCPF(valor) {
  const cpf = numeros(valor);

  return cpf.length === 11
    ? cpf.replace(
        /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
        "$1.$2.$3-$4"
      )
    : String(valor || "");
}

function formatarTelefone(valor) {
  const tel = numeros(valor).slice(0, 11);

  if (tel.length === 11) {
    return tel.replace(
      /^(\d{2})(\d{5})(\d{4})$/,
      "($1) $2-$3"
    );
  }

  if (tel.length === 10) {
    return tel.replace(
      /^(\d{2})(\d{4})(\d{4})$/,
      "($1) $2-$3"
    );
  }

  return String(valor || "");
}

function normalizarNascimento(valor) {
  if (typeof valor !== "string") return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return valor;
  }

  const partes = valor.match(
    /^(\d{2})\/(\d{2})\/(\d{4})$/
  );

  return partes
    ? `${partes[3]}-${partes[2]}-${partes[1]}`
    : "";
}

function dataValida(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false;
  }

  const [ano, mes, dia] = valor
    .split("-")
    .map(Number);

  const data = new Date(ano, mes - 1, dia);
  const hoje = new Date();

  hoje.setHours(23, 59, 59, 999);

  return (
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia &&
    data <= hoje
  );
}

function iniciais(nome = "") {
  return (
    String(nome)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0] || "")
      .join("")
      .toUpperCase() || "?"
  );
}

function normalizarNomeBusca(valor) {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function mensagemFirebase(erro) {
  if (
    [
      "permission-denied",
      "storage/unauthorized",
    ].includes(erro?.code)
  ) {
    return (
      "O Firebase não autorizou esta operação. " +
      "Precisaremos revisar as regras de acesso."
    );
  }

  if (
    [
      "auth/wrong-password",
      "auth/invalid-credential",
    ].includes(erro?.code)
  ) {
    return "A senha atual está incorreta.";
  }

  if (erro?.code === "auth/requires-recent-login") {
    return (
      "Por segurança, entre novamente na conta " +
      "antes de alterar a senha."
    );
  }

  if (erro?.code === "auth/too-many-requests") {
    return (
      "Muitas tentativas. Aguarde um pouco " +
      "antes de tentar novamente."
    );
  }

  if (
    [
      "unavailable",
      "auth/network-request-failed",
      "storage/retry-limit-exceeded",
    ].includes(erro?.code)
  ) {
    return (
      "Falha de conexão com o Firebase. " +
      "Tente novamente."
    );
  }

  return (
    erro?.message ||
    "Não foi possível concluir a operação."
  );
}

// =====================================================
// CONTROLE DE PREFERÊNCIAS
// =====================================================

function Chave({ ligado, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      className={`mc-chave ${
        ligado ? "mc-chave-ativa" : ""
      }`}
      onClick={() => onChange(!ligado)}
      disabled={disabled}
    >
      <span />
    </button>
  );
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

export default function MinhaConta() {
  const navigate = useNavigate();
  const inputFoto = useRef(null);

  // Carregamento
  const [carregando, setCarregando] =
    useState(true);

  const [
    erroCarregamento,
    setErroCarregamento,
  ] = useState("");

  const [perfil, setPerfil] = useState(null);

  // Dados pessoais
  const [original, setOriginal] =
    useState(CAMPOS_VAZIOS);

  const [form, setForm] =
    useState(CAMPOS_VAZIOS);

  const [prefs, setPrefs] =
    useState(PREFS_VAZIAS);

  const [fotoURL, setFotoURL] = useState("");

  // Feedbacks
  const [
    mensagemPerfil,
    setMensagemPerfil,
  ] = useState(null);

  const [
    mensagemPrefs,
    setMensagemPrefs,
  ] = useState(null);

  const [
    mensagemFoto,
    setMensagemFoto,
  ] = useState(null);

  const [
    mensagemSenha,
    setMensagemSenha,
  ] = useState(null);

  const [
    mensagemConta,
    setMensagemConta,
  ] = useState(null);

  // Estados de ações
  const [
    salvandoPerfil,
    setSalvandoPerfil,
  ] = useState(false);

  const [
    salvandoPrefs,
    setSalvandoPrefs,
  ] = useState(false);

  const [
    enviandoFoto,
    setEnviandoFoto,
  ] = useState(false);

  const [
    alterandoSenha,
    setAlterandoSenha,
  ] = useState(false);

  // Segurança
  const [mostrarSenha, setMostrarSenha] =
    useState(false);

  const [senha, setSenha] = useState({
    atual: "",
    nova: "",
    confirmar: "",
  });

  // Navegação
  const [abaAtiva, setAbaAtiva] =
    useState("dados");

  const [menuMobile, setMenuMobile] =
    useState(false);

  const [notificacoes, setNotificacoes] =
    useState(false);

  const [
    formSenhaAberto,
    setFormSenhaAberto,
  ] = useState(false);

  // ===================================================
  // LEITURA REAL DOS DADOS DO FIREBASE
  // ===================================================

  useEffect(() => {
    let ativo = true;

    const cancelar = onAuthStateChanged(
      auth,
      async (conta) => {
        if (!conta) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        setCarregando(true);
        setErroCarregamento("");

        try {
          const registro = await getDoc(
            doc(db, "usuarios", conta.uid)
          );

          if (!ativo) return;

          if (!registro.exists()) {
            throw new Error(
              "Cadastro não encontrado no Firestore."
            );
          }

          const dados = registro.data();

          // Somente pacientes acessam esta versão.
          if (dados.tipo !== "paciente") {
            navigate("/psicologo", {
              replace: true,
            });

            return;
          }

          const formulario = {
            nome: dados.nome || "",

            telefone: formatarTelefone(
              dados.telefone
            ),

            nascimento: normalizarNascimento(
              dados.nascimento
            ),

            cidade:
              dados.cidade ||
              dados.endereco?.cidade ||
              "",

            uf:
              dados.uf ||
              dados.endereco?.uf ||
              "",
          };

          setPerfil({
            uid: conta.uid,

            email:
              conta.email ||
              dados.email ||
              "",

            cpf: dados.cpf || "",
            nome: dados.nome || "",
          });

          setForm(formulario);
          setOriginal(formulario);

          setFotoURL(
            dados.fotoURL ||
            conta.photoURL ||
            ""
          );

          setPrefs({
            avisosEmail:
              dados.preferencias?.avisosEmail ===
              true,

            lembretesAtendimento:
              dados.preferencias
                ?.lembretesAtendimento === true,

            conteudosBemEstar:
              dados.preferencias
                ?.conteudosBemEstar === true,
          });
        } catch (erro) {
          if (ativo) {
            setErroCarregamento(
              mensagemFirebase(erro)
            );
          }
        } finally {
          if (ativo) {
            setCarregando(false);
          }
        }
      },

      (erro) => {
        if (ativo) {
          setErroCarregamento(
            mensagemFirebase(erro)
          );

          setCarregando(false);
        }
      }
    );

    return () => {
      ativo = false;
      cancelar();
    };
  }, [navigate]);

  // ===================================================
  // EDIÇÃO DOS CAMPOS
  // ===================================================

  function alterarCampo(campo, valor) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    setMensagemPerfil(null);
  }

  function navegarPara(id) {
    setAbaAtiva(id);

    document
      .getElementById(`mc-${id}`)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  // ===================================================
  // SALVAR PERFIL NO FIRESTORE
  // ===================================================

  async function salvarPerfil(evento) {
    evento.preventDefault();

    if (!perfil || salvandoPerfil) return;

    setMensagemPerfil(null);

    const nome = form.nome
      .trim()
      .replace(/\s+/g, " ");

    const telefone = numeros(form.telefone);
    const cidade = form.cidade.trim();
    const uf = form.uf.trim().toUpperCase();

    if (nome.length < 3) {
      setMensagemPerfil({
        erro: true,
        texto: "Informe seu nome completo.",
      });

      return;
    }

    if (![10, 11].includes(telefone.length)) {
      setMensagemPerfil({
        erro: true,
        texto:
          "Informe um telefone com DDD válido.",
      });

      return;
    }

    if (!dataValida(form.nascimento)) {
      setMensagemPerfil({
        erro: true,
        texto:
          "Informe uma data de nascimento válida.",
      });

      return;
    }

    if (uf && !ESTADOS.includes(uf)) {
      setMensagemPerfil({
        erro: true,
        texto: "Selecione uma UF válida.",
      });

      return;
    }

    setSalvandoPerfil(true);

    try {
      await updateDoc(
        doc(db, "usuarios", perfil.uid),
        {
          nome,
          telefone,
          nascimento: form.nascimento,
          cidade,
          uf,
          atualizadoEm: serverTimestamp(),
        }
      );

      const salvo = {
        ...form,
        nome,
        telefone: formatarTelefone(telefone),
        cidade,
        uf,
      };

      setForm(salvo);
      setOriginal(salvo);

      setPerfil((anterior) => ({
        ...anterior,
        nome,
      }));

      setMensagemPerfil({
        erro: false,
        texto:
          "Informações atualizadas com sucesso.",
      });

      // Sincroniza o índice de busca de pacientes.
      // Se falhar, o cadastro principal permanece salvo.

      if (nome !== original.nome) {
        try {
          await setDoc(
            doc(
              db,
              "pacientesBusca",
              perfil.uid
            ),
            {
              uid: perfil.uid,
              nome,
              nomeBusca:
                normalizarNomeBusca(nome),
            },
            { merge: true }
          );
        } catch (erroIndice) {
          console.error(
            "Falha ao sincronizar pacientesBusca:",
            erroIndice
          );

          setMensagemPerfil({
            erro: true,
            texto:
              "Perfil salvo, mas a busca de pacientes não foi sincronizada. Precisaremos ajustar as regras do Firestore.",
          });
        }
      }
    } catch (erro) {
      setMensagemPerfil({
        erro: true,
        texto: mensagemFirebase(erro),
      });
    } finally {
      setSalvandoPerfil(false);
    }
  }

  // ===================================================
  // SALVAR PREFERÊNCIAS
  // ===================================================

  async function salvarPreferencias() {
    if (!perfil || salvandoPrefs) return;

    setMensagemPrefs(null);
    setSalvandoPrefs(true);

    try {
      await updateDoc(
        doc(db, "usuarios", perfil.uid),
        {
          "preferencias.avisosEmail":
            prefs.avisosEmail,

          "preferencias.lembretesAtendimento":
            prefs.lembretesAtendimento,

          "preferencias.conteudosBemEstar":
            prefs.conteudosBemEstar,
        }
      );

      setMensagemPrefs({
        erro: false,
        texto:
          "Preferências salvas na sua conta.",
      });
    } catch (erro) {
      setMensagemPrefs({
        erro: true,
        texto: mensagemFirebase(erro),
      });
    } finally {
      setSalvandoPrefs(false);
    }
  }

  // ===================================================
  // FOTO DE PERFIL — FIREBASE STORAGE
  // ===================================================

  async function trocarFoto(evento) {
    const arquivo = evento.target.files?.[0];

    evento.target.value = "";

    if (
      !arquivo ||
      !perfil ||
      enviandoFoto
    ) {
      return;
    }

    setMensagemFoto(null);

    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(arquivo.type)
    ) {
      setMensagemFoto({
        erro: true,
        texto:
          "Use uma imagem JPG, PNG ou WEBP.",
      });

      return;
    }

    if (
      arquivo.size > 5 * 1024 * 1024
    ) {
      setMensagemFoto({
        erro: true,
        texto:
          "A foto deve ter até 5 MB.",
      });

      return;
    }

    setEnviandoFoto(true);

    try {
      const extensao = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      }[arquivo.type];

      const caminho =
        `usuarios/${perfil.uid}/perfil/` +
        `foto-${Date.now()}.${extensao}`;

      const storage = getStorage(auth.app);

      const referencia = ref(
        storage,
        caminho
      );

      await uploadBytes(
        referencia,
        arquivo,
        {
          contentType: arquivo.type,
        }
      );

      const url = await getDownloadURL(
        referencia
      );

      await updateDoc(
        doc(db, "usuarios", perfil.uid),
        { fotoURL: url }
      );

      setFotoURL(url);

      setMensagemFoto({
        erro: false,
        texto:
          "Foto de perfil atualizada.",
      });
    } catch (erro) {
      setMensagemFoto({
        erro: true,
        texto: mensagemFirebase(erro),
      });
    } finally {
      setEnviandoFoto(false);
    }
  }

  // ===================================================
  // ALTERAÇÃO DE SENHA
  // ===================================================

  async function salvarSenha(evento) {
    evento.preventDefault();

    if (
      alterandoSenha ||
      !auth.currentUser
    ) {
      return;
    }

    setMensagemSenha(null);

    if (
      senha.nova !== senha.confirmar
    ) {
      setMensagemSenha({
        erro: true,
        texto:
          "A confirmação não coincide com a nova senha.",
      });

      return;
    }

    const faltantes =
      requisitosSenha.filter(
        ({ atende }) =>
          !atende(senha.nova)
      );

    if (faltantes.length) {
      setMensagemSenha({
        erro: true,
        texto:
          "A nova senha precisa de: " +
          faltantes
            .map((item) =>
              item.texto.toLowerCase()
            )
            .join(", ") +
          ".",
      });

      return;
    }

    setAlterandoSenha(true);

    try {
      const conta = auth.currentUser;

      if (!conta.email) {
        throw new Error(
          "Esta conta não possui e-mail de acesso."
        );
      }

      await reauthenticateWithCredential(
        conta,
        EmailAuthProvider.credential(
          conta.email,
          senha.atual
        )
      );

      await updatePassword(
        conta,
        senha.nova
      );

      setSenha({
        atual: "",
        nova: "",
        confirmar: "",
      });

      setFormSenhaAberto(false);

      setMensagemSenha({
        erro: false,
        texto:
          "Senha atualizada com sucesso.",
      });
    } catch (erro) {
      setMensagemSenha({
        erro: true,
        texto: mensagemFirebase(erro),
      });
    } finally {
      setAlterandoSenha(false);
    }
  }

  // ===================================================
  // SAIR
  // ===================================================

  async function sair() {
    setMensagemConta(null);

    try {
      await signOut(auth);

      navigate("/login", {
        replace: true,
      });
    } catch (erro) {
      setMensagemConta({
        erro: true,
        texto: mensagemFirebase(erro),
      });
    }
  }

  // ===================================================
  // ESTADO DE CARREGAMENTO
  // ===================================================

  if (carregando) {
    return (
      <main className="mc-estado">
        Carregando as informações da sua conta...
      </main>
    );
  }

  if (
    erroCarregamento ||
    !perfil
  ) {
    return (
      <main className="mc-estado">
        <h1>
          Não foi possível abrir sua conta
        </h1>

        <p>
          {erroCarregamento ||
            "Faça login para continuar."}
        </p>

        <Link
          to="/login"
          className="mc-botao mc-botao-principal"
        >
          Voltar ao login
        </Link>
      </main>
    );
  }

  // ===================================================
  // INTERFACE
  // ===================================================

  return (
    <div className="mc-pagina">

      {/* HEADER */}

      <header className="mc-topbar">
        <div className="mc-topbar-interno">

          <Link
            to="/cliente"
            className="mc-logo"
            aria-label="Elora — página inicial"
          >
            <img
              src="/images/logo-elora.png"
              alt=""
            />

            <span>elora</span>
          </Link>

          <button
            type="button"
            className="mc-menu-mobile"
            aria-label="Alternar navegação"
            aria-expanded={menuMobile}
            onClick={() =>
              setMenuMobile((valor) => !valor)
            }
          >
            <Icone nome="menu" />
          </button>

          <nav
            className={`mc-nav ${
              menuMobile
                ? "mc-nav-aberto"
                : ""
            }`}
            aria-label="Navegação do paciente"
          >
            <Link to="/cliente">
              <Icone nome="inicio" />
              Início
            </Link>

            <Link to="/cliente#eh-profissionais">
              <Icone nome="busca" />
              Buscar Psicólogo(a)
            </Link>

            <Link to="/cliente/atendimentos">
              <Icone nome="calendario" />
              Meus Atendimentos
            </Link>

            <Link to="/triagem">
              <Icone nome="coracao" />
              Triagem
            </Link>

            <Link
              to="/minha-conta"
              className="mc-nav-ativo"
              aria-current="page"
            >
              <Icone nome="usuario" />
              Minha Conta
            </Link>
          </nav>

          <div className="mc-topbar-acoes">

            {/* NOTIFICAÇÕES */}

            <div className="mc-notificacoes-wrap">
              <button
                type="button"
                className="mc-icone-topo"
                aria-label="Avisos"
                aria-expanded={notificacoes}
                onClick={() =>
                  setNotificacoes(
                    (valor) => !valor
                  )
                }
              >
                <Icone nome="sino" />
              </button>

              {notificacoes && (
                <div className="mc-popover">
                  A central de notificações será
                  integrada ao sistema de atendimentos.
                </div>
              )}
            </div>

            {/* FOTO REAL OU INICIAIS */}

            <span
              className="mc-avatar-topo"
              title={perfil.nome}
            >
              {fotoURL ? (
                <img
                  src={fotoURL}
                  alt=""
                />
              ) : (
                iniciais(perfil.nome)
              )}
            </span>
          </div>
        </div>
      </header>

      {/* BANNER */}

      <section
        className="mc-hero"
        aria-labelledby="mc-titulo-pagina"
      >
        <div className="mc-hero-interior">
          <p className="mc-eyebrow">
            MINHA CONTA
          </p>

          <h1 id="mc-titulo-pagina">
            Minha Conta
          </h1>

          <p>
            Gerencie seus dados, preferências
            e a segurança da sua conta na Elora.
          </p>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL */}

      <main className="mc-container">
        <div className="mc-layout">

          {/* SIDEBAR */}

          <aside
            className="mc-sidebar"
            aria-label="Seções da conta"
          >
            <div className="mc-identidade">

              {/* FOTO */}

              <div className="mc-avatar-grande">
                {fotoURL ? (
                  <img
                    src={fotoURL}
                    alt={`Foto de perfil de ${perfil.nome}`}
                  />
                ) : (
                  <span>
                    {iniciais(perfil.nome)}
                  </span>
                )}

                <button
                  type="button"
                  className="mc-alterar-avatar"
                  aria-label="Alterar foto"
                  disabled={enviandoFoto}
                  onClick={() =>
                    inputFoto.current?.click()
                  }
                >
                  <Icone
                    nome="camera"
                    tamanho={19}
                  />
                </button>
              </div>

              <input
                ref={inputFoto}
                type="file"
                hidden
                accept="image/jpeg,image/png,image/webp"
                onChange={trocarFoto}
                aria-label="Selecionar foto do perfil"
              />

              <h2>
                {perfil.nome ||
                  "Nome não informado"}
              </h2>

              <p>Paciente da Elora</p>

              <button
                type="button"
                className="mc-link-foto"
                disabled={enviandoFoto}
                onClick={() =>
                  inputFoto.current?.click()
                }
              >
                {enviandoFoto
                  ? "Enviando foto..."
                  : "Alterar foto"}
              </button>

              {mensagemFoto && (
                <p
                  role="status"
                  className={`mc-mensagem ${
                    mensagemFoto.erro
                      ? "mc-erro"
                      : "mc-sucesso"
                  }`}
                >
                  {mensagemFoto.texto}
                </p>
              )}
            </div>

            {/* MENU LATERAL */}

            <div className="mc-sidebar-menu">
              <button
                type="button"
                className={
                  abaAtiva === "dados"
                    ? "mc-item-ativo"
                    : ""
                }
                onClick={() =>
                  navegarPara("dados")
                }
              >
                <Icone nome="usuario" />
                Dados do perfil
              </button>

              <button
                type="button"
                className={
                  abaAtiva === "preferencias"
                    ? "mc-item-ativo"
                    : ""
                }
                onClick={() =>
                  navegarPara("preferencias")
                }
              >
                <Icone nome="sino" />
                Preferências
              </button>

              <button
                type="button"
                className={
                  abaAtiva === "seguranca"
                    ? "mc-item-ativo"
                    : ""
                }
                onClick={() =>
                  navegarPara("seguranca")
                }
              >
                <Icone nome="escudo" />
                Segurança
              </button>

              <span
                className="mc-item-indisponivel"
                title="Integração de pagamentos ainda não disponível"
              >
                <Icone nome="cartao" />
                Pagamentos
                <small>Em breve</small>
              </span>

              <span className="mc-menu-divisor" />

              <button
                type="button"
                onClick={sair}
              >
                <Icone nome="sair" />
                Sair da conta
              </button>

              {mensagemConta && (
                <p
                  role="alert"
                  className="mc-mensagem mc-erro"
                >
                  {mensagemConta.texto}
                </p>
              )}
            </div>
          </aside>

          {/* ÁREA DOS CARDS */}

          <div className="mc-area-principal">

            {/* DADOS DO PERFIL */}

            <section
              className="mc-cartao mc-cartao-dados"
              id="mc-dados"
              aria-labelledby="mc-dados-titulo"
            >
              <div className="mc-cartao-cabecalho">
                <span className="mc-titulo-icone">
                  <Icone
                    nome="usuario"
                    tamanho={28}
                  />
                </span>

                <div>
                  <h2 id="mc-dados-titulo">
                    Dados do perfil
                  </h2>

                  <p>
                    Mantenha suas informações
                    sempre atualizadas.
                  </p>
                </div>
              </div>

              <form onSubmit={salvarPerfil}>
                <div className="mc-campos">

                  <label>
                    Nome completo
                    <span aria-hidden="true">
                      *
                    </span>

                    <input
                      type="text"
                      autoComplete="name"
                      maxLength={120}
                      required
                      value={form.nome}
                      onChange={(evento) =>
                        alterarCampo(
                          "nome",
                          evento.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    E-mail

                    <input
                      type="email"
                      value={perfil.email}
                      readOnly
                      aria-describedby="mc-email-ajuda"
                    />

                    <small id="mc-email-ajuda">
                      E-mail vinculado ao login;
                      não editável nesta tela.
                    </small>
                  </label>

                  <label>
                    Telefone
                    <span aria-hidden="true">
                      *
                    </span>

                    <input
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      maxLength={18}
                      required
                      value={form.telefone}
                      onChange={(evento) =>
                        alterarCampo(
                          "telefone",
                          evento.target.value
                        )
                      }
                      placeholder="(47) 99999-9999"
                    />
                  </label>

                  <label>
                    Data de nascimento
                    <span aria-hidden="true">
                      *
                    </span>

                    <input
                      type="date"
                      autoComplete="bday"
                      required
                      value={form.nascimento}
                      max={
                        new Date(
                          Date.now() -
                          new Date()
                            .getTimezoneOffset() *
                            60000
                        )
                          .toISOString()
                          .slice(0, 10)
                      }
                      onChange={(evento) =>
                        alterarCampo(
                          "nascimento",
                          evento.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    CPF

                    <input
                      type="text"
                      value={formatarCPF(
                        perfil.cpf
                      )}
                      readOnly
                      aria-describedby="mc-cpf-ajuda"
                    />

                    <small id="mc-cpf-ajuda">
                      CPF cadastrado; não alterável
                      por esta página.
                    </small>
                  </label>

                  <div className="mc-localizacao">
                    <label>
                      Cidade
                      <span className="mc-opcional">
                        (opcional)
                      </span>

                      <input
                        type="text"
                        maxLength={100}
                        autoComplete="address-level2"
                        value={form.cidade}
                        onChange={(evento) =>
                          alterarCampo(
                            "cidade",
                            evento.target.value
                          )
                        }
                        placeholder="Não informada"
                      />
                    </label>

                    <label>
                      UF
                      <span className="mc-opcional">
                        (opcional)
                      </span>

                      <select
                        value={form.uf}
                        onChange={(evento) =>
                          alterarCampo(
                            "uf",
                            evento.target.value
                          )
                        }
                        autoComplete="address-level1"
                      >
                        <option value="">
                          —
                        </option>

                        {ESTADOS.map((uf) => (
                          <option
                            key={uf}
                            value={uf}
                          >
                            {uf}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                {mensagemPerfil && (
                  <p
                    role="status"
                    className={`mc-mensagem ${
                      mensagemPerfil.erro
                        ? "mc-erro"
                        : "mc-sucesso"
                    }`}
                  >
                    {mensagemPerfil.texto}
                  </p>
                )}

                <div className="mc-form-acoes">
                  <button
                    type="button"
                    className="mc-botao mc-botao-contorno"
                    disabled={salvandoPerfil}
                    onClick={() => {
                      setForm(original);
                      setMensagemPerfil(null);
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="mc-botao mc-botao-principal"
                    disabled={salvandoPerfil}
                  >
                    <Icone
                      nome="check"
                      tamanho={18}
                    />

                    {salvandoPerfil
                      ? "Salvando..."
                      : "Salvar alterações"}
                  </button>
                </div>
              </form>
            </section>

            {/* PREFERÊNCIAS + SEGURANÇA */}

            <div className="mc-secoes-inferiores">

              {/* PREFERÊNCIAS */}

              <section
                className="mc-cartao"
                id="mc-preferencias"
                aria-labelledby="mc-preferencias-titulo"
              >
                <div className="mc-cartao-cabecalho">
                  <span className="mc-titulo-icone">
                    <Icone
                      nome="sino"
                      tamanho={26}
                    />
                  </span>

                  <div>
                    <h2 id="mc-preferencias-titulo">
                      Preferências
                    </h2>

                    <p>
                      Personalize sua experiência
                      na Elora.
                    </p>
                  </div>
                </div>

                <div className="mc-preferencia-linha">
                  <Icone
                    nome="envelope"
                    tamanho={23}
                  />

                  <div>
                    <strong>
                      Avisos por e-mail
                    </strong>

                    <p>
                      Preferência para receber
                      novidades da Elora.
                    </p>
                  </div>

                  <Chave
                    ligado={prefs.avisosEmail}
                    disabled={salvandoPrefs}
                    onChange={(valor) => {
                      setPrefs((anterior) => ({
                        ...anterior,
                        avisosEmail: valor,
                      }));

                      setMensagemPrefs(null);
                    }}
                  />
                </div>

                <div className="mc-preferencia-linha">
                  <Icone
                    nome="calendario"
                    tamanho={23}
                  />

                  <div>
                    <strong>
                      Lembretes de atendimentos
                    </strong>

                    <p>
                      Preferência para futuros
                      lembretes das sessões.
                    </p>
                  </div>

                  <Chave
                    ligado={
                      prefs.lembretesAtendimento
                    }
                    disabled={salvandoPrefs}
                    onChange={(valor) => {
                      setPrefs((anterior) => ({
                        ...anterior,
                        lembretesAtendimento: valor,
                      }));

                      setMensagemPrefs(null);
                    }}
                  />
                </div>

                <div className="mc-preferencia-linha">
                  <Icone
                    nome="coracao"
                    tamanho={23}
                  />

                  <div>
                    <strong>
                      Conteúdos de bem-estar
                    </strong>

                    <p>
                      Preferência para dicas
                      e materiais informativos.
                    </p>
                  </div>

                  <Chave
                    ligado={prefs.conteudosBemEstar}
                    disabled={salvandoPrefs}
                    onChange={(valor) => {
                      setPrefs((anterior) => ({
                        ...anterior,
                        conteudosBemEstar: valor,
                      }));

                      setMensagemPrefs(null);
                    }}
                  />
                </div>

                <p className="mc-observacao">
                  As opções ficam registradas na
                  conta. O envio automático será
                  integrado posteriormente.
                </p>

                {mensagemPrefs && (
                  <p
                    role="status"
                    className={`mc-mensagem ${
                      mensagemPrefs.erro
                        ? "mc-erro"
                        : "mc-sucesso"
                    }`}
                  >
                    {mensagemPrefs.texto}
                  </p>
                )}

                <button
                  type="button"
                  className="mc-botao mc-botao-principal mc-botao-preferencias"
                  disabled={salvandoPrefs}
                  onClick={salvarPreferencias}
                >
                  {salvandoPrefs
                    ? "Salvando..."
                    : "Salvar preferências"}
                </button>
              </section>

              {/* SEGURANÇA */}

              <section
                className="mc-cartao"
                id="mc-seguranca"
                aria-labelledby="mc-seguranca-titulo"
              >
                <div className="mc-cartao-cabecalho">
                  <span className="mc-titulo-icone">
                    <Icone
                      nome="escudo"
                      tamanho={26}
                    />
                  </span>

                  <div>
                    <h2 id="mc-seguranca-titulo">
                      Segurança da conta
                    </h2>

                    <p>
                      Proteja seus dados e acessos.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="mc-acao-seguranca"
                  onClick={() =>
                    setFormSenhaAberto(
                      (valor) => !valor
                    )
                  }
                >
                  <Icone
                    nome="cadeado"
                    tamanho={23}
                  />

                  <span>
                    <strong>
                      Alterar senha
                    </strong>

                    <small>
                      Atualize sua senha de acesso.
                    </small>
                  </span>

                  <span aria-hidden="true">
                    ›
                  </span>
                </button>

                {formSenhaAberto && (
                  <form
                    className="mc-form-senha"
                    onSubmit={salvarSenha}
                  >
                    <label>
                      Senha atual

                      <input
                        type={
                          mostrarSenha
                            ? "text"
                            : "password"
                        }
                        autoComplete="current-password"
                        required
                        value={senha.atual}
                        onChange={(evento) =>
                          setSenha((anterior) => ({
                            ...anterior,
                            atual:
                              evento.target.value,
                          }))
                        }
                      />
                    </label>

                    <label>
                      Nova senha

                      <input
                        type={
                          mostrarSenha
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        required
                        value={senha.nova}
                        onChange={(evento) =>
                          setSenha((anterior) => ({
                            ...anterior,
                            nova:
                              evento.target.value,
                          }))
                        }
                      />
                    </label>

                    <label>
                      Confirmar nova senha

                      <input
                        type={
                          mostrarSenha
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        required
                        value={senha.confirmar}
                        onChange={(evento) =>
                          setSenha((anterior) => ({
                            ...anterior,
                            confirmar:
                              evento.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="mc-mostrar-senha">
                      <input
                        type="checkbox"
                        checked={mostrarSenha}
                        onChange={(evento) =>
                          setMostrarSenha(
                            evento.target.checked
                          )
                        }
                      />

                      Mostrar senhas
                    </label>

                    <button
                      type="submit"
                      className="mc-botao mc-botao-principal"
                      disabled={alterandoSenha}
                    >
                      {alterandoSenha
                        ? "Atualizando..."
                        : "Atualizar senha"}
                    </button>
                  </form>
                )}

                {mensagemSenha && (
                  <p
                    role="status"
                    className={`mc-mensagem ${
                      mensagemSenha.erro
                        ? "mc-erro"
                        : "mc-sucesso"
                    }`}
                  >
                    {mensagemSenha.texto}
                  </p>
                )}

                <button
                  type="button"
                  className="mc-acao-seguranca"
                  onClick={sair}
                >
                  <Icone
                    nome="monitor"
                    tamanho={23}
                  />

                  <span>
                    <strong>
                      Encerrar sessão atual
                    </strong>

                    <small>
                      Sair deste dispositivo.
                    </small>
                  </span>

                  <span aria-hidden="true">
                    ›
                  </span>
                </button>

                <div className="mc-acao-seguranca mc-acao-inativa">
                  <Icone
                    nome="escudo"
                    tamanho={23}
                  />

                  <span>
                    <strong>
                      Verificação em duas etapas
                    </strong>

                    <small>
                      Funcionalidade planejada.
                    </small>
                  </span>

                  <span className="mc-em-breve">
                    Em breve
                  </span>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
