
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDocFromServer,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

const numeros = (valor) =>
  String(valor || "").replace(/\D/g, "");

const texto = (valor) =>
  String(valor || "").trim();

function normalizarNascimento(valor) {
  if (valor.includes("/")) {
    const [dia, mes, ano] =
      valor.split("/");

    return `${ano}-${mes}-${dia}`;
  }

  return valor;
}

function normalizarNomeBusca(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// =====================================================
// CADASTRO NO FIREBASE
// =====================================================

export async function cadastrarNoFirebase(
  form,
  tipo
) {
  const email = texto(
    form.email
  ).toLowerCase();

  let usuario;

  try {
    // ================================================
    // 1. CRIAR OU RECUPERAR CONTA NO AUTHENTICATION
    // ================================================

    try {
      const resultado =
        await createUserWithEmailAndPassword(
          auth,
          email,
          form.senha
        );

      usuario = resultado.user;
    } catch (erro) {
      if (
        erro.code !==
        "auth/email-already-in-use"
      ) {
        throw erro;
      }

      const resultado =
        await signInWithEmailAndPassword(
          auth,
          email,
          form.senha
        );

      usuario = resultado.user;
    }

    // ================================================
    // 2. VERIFICAR PERFIL EXISTENTE
    // ================================================

    const referencia = doc(
      db,
      "usuarios",
      usuario.uid
    );

    const existente =
      await getDocFromServer(referencia);

    if (existente.exists()) {
      throw new Error(
        "Este e-mail já tem um perfil na Elora. Use a tela de login."
      );
    }

    // ================================================
    // 3. PREPARAR PERFIL PRINCIPAL
    // ================================================

    const perfil = {
      nome: texto(form.nome),

      cpf: numeros(form.cpf),

      nascimento: normalizarNascimento(
        texto(form.nascimento)
      ),

      email: usuario.email,

      telefone: numeros(
        form.telefone
      ),

      tipo,

      criadoEm: serverTimestamp(),
    };

    // ================================================
    // 4. NOME SOCIAL E GÊNERO
    // ================================================

    if (texto(form.nomeSocial)) {
      perfil.nomeSocial =
        texto(form.nomeSocial);

      perfil.nomePublico =
        texto(form.nomeSocial);
    }

    if (texto(form.genero)) {
      perfil.genero = texto(form.genero);
    }

    // ================================================
    // 5. CAMPOS DO PACIENTE
    // ================================================

    if (tipo === "paciente") {
      if (texto(form.cidade)) {
        perfil.cidade =
          texto(form.cidade);
      }

      if (texto(form.uf)) {
        perfil.uf = texto(
          form.uf
        ).toUpperCase();
      }
    }

    // ================================================
    // 6. CAMPOS DO PSICÓLOGO
    // ================================================

    if (tipo === "psicologo") {
      perfil.crp = texto(
        form.crp
      );

      // O CRP não é validado
      // automaticamente neste cadastro.
      perfil.status = "pendente";

      if (texto(form.areaAtuacao)) {
        perfil.areaAtuacao =
          texto(form.areaAtuacao);
      }

      const endereco = form.endereco;

      perfil.endereco = endereco
        ? {
            cep: numeros(
              endereco.cep
            ),

            rua: texto(
              endereco.rua
            ),

            numero: texto(
              endereco.numero
            ),

            complemento: texto(
              endereco.complemento
            ),

            bairro: texto(
              endereco.bairro
            ),

            cidade: texto(
              endereco.cidade
            ),

            uf: texto(
              endereco.uf
            ).toUpperCase(),
          }
        : null;
    }

    // ================================================
    // 7. SALVAR DOCUMENTO NO FIRESTORE
    // ================================================

    await setDoc(
      referencia,
      perfil
    );

    // ================================================
    // 8. ÍNDICE DE BUSCA DOS PACIENTES
    // ================================================

    if (tipo === "paciente") {
      const pacienteBusca = {
        uid: usuario.uid,

        nome: perfil.nome,

        nomeBusca:
          normalizarNomeBusca(
            perfil.nome
          ),
      };

      try {
        await setDoc(
          doc(
            db,
            "pacientesBusca",
            usuario.uid
          ),
          pacienteBusca
        );
      } catch (erroIndice) {
        console.error(
          "Erro ao indexar paciente:",
          erroIndice
        );

        // O cadastro principal
        // não é desfeito se o
        // índice secundário falhar.
      }
    }
  } finally {
    // Mantém o fluxo atual:
    // a sessão é encerrada após cadastro.

    if (usuario) {
      await signOut(auth);
    }
  }
}

// =====================================================
// LOGIN NO FIREBASE
// =====================================================

export async function entrarNoFirebase(
  email,
  senha,
  tipoEsperado
) {
  const resultado =
    await signInWithEmailAndPassword(
      auth,
      texto(email).toLowerCase(),
      senha
    );

  const usuario = resultado.user;

  try {
    const referencia = doc(
      db,
      "usuarios",
      usuario.uid
    );

    const documento =
      await getDocFromServer(
        referencia
      );

    if (!documento.exists()) {
      throw new Error(
        "Seu perfil ainda não está disponível."
      );
    }

    const perfil = documento.data();

    if (
      tipoEsperado &&
      perfil.tipo !== tipoEsperado
    ) {
      throw new Error(
        "Este login não corresponde ao seu tipo de conta."
      );
    }

    return {
      usuario,
      perfil,
    };
  } catch (erro) {
    await signOut(auth);

    throw erro;
  }
}

// =====================================================
// MENSAGENS DE ERRO DO LOGIN
// =====================================================

export function mensagemErroLogin(erro) {
  switch (erro.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-mail ou senha incorretos.";

    case "auth/network-request-failed":
      return (
        "Sem conexão. Verifique sua internet " +
        "e tente novamente."
      );

    case "permission-denied":
      return (
        "O Firestore não permitiu " +
        "consultar seu perfil."
      );

    default:
      return erro.code
        ? "Não foi possível entrar na conta."
        : erro.message;
  }
}

// =====================================================
// MENSAGENS DE ERRO DO CADASTRO
// =====================================================

export function mensagemErroCadastro(erro) {
  switch (erro.code) {
    case "permission-denied":
      return (
        "O Firestore recusou o cadastro. " +
        "Revise as regras de acesso e os " +
        "campos permitidos."
      );

    case "auth/invalid-credential":
    case "auth/wrong-password":
      return (
        "Não foi possível continuar com " +
        "esse e-mail e senha. Confira os dados."
      );

    case "auth/email-already-in-use":
      return (
        "Já existe uma conta com este e-mail. " +
        "Utilize a página de login."
      );

    case "auth/weak-password":
      return "Escolha uma senha mais forte.";

    case "auth/operation-not-allowed":
      return (
        "Habilite E-mail/senha no " +
        "Firebase Authentication."
      );

    case "auth/network-request-failed":
    case "unavailable":
      return (
        "Falha de conexão. Tente novamente " +
        "com o mesmo e-mail e senha."
      );

    default:
      return erro.code
        ? "Não foi possível concluir o cadastro."
        : erro.message;
  }
}
