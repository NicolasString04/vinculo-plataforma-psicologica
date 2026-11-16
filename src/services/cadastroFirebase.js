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

// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

const numeros = (valor) =>
  String(valor || "").replace(/\D/g, "");

function normalizarNascimento(valor) {
  if (valor.includes("/")) {
    const [dia, mes, ano] = valor.split("/");
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

// ======================================================
// CADASTRO NO FIREBASE
// ======================================================

export async function cadastrarNoFirebase(
  form,
  tipo,
  informarEndereco = false
) {
  const email = form.email.trim().toLowerCase();

  let usuario;

  try {
    // 1. CRIAR OU RECUPERAR CONTA NO AUTHENTICATION

    try {
      const resultado = await createUserWithEmailAndPassword(
        auth,
        email,
        form.senha
      );

      usuario = resultado.user;
    } catch (erro) {
      if (erro.code !== "auth/email-already-in-use") {
        throw erro;
      }

      const resultado = await signInWithEmailAndPassword(
        auth,
        email,
        form.senha
      );

      usuario = resultado.user;
    }

    // 2. VERIFICAR DOCUMENTO EM USUARIOS

    const referencia = doc(
      db,
      "usuarios",
      usuario.uid
    );

    const existente = await getDocFromServer(referencia);

    if (existente.exists()) {
      throw new Error(
        "Este e-mail já tem um perfil no Elora. Use a tela de login."
      );
    }

    // 3. PREPARAR CADASTRO PRINCIPAL

    const perfil = {
      nome: form.nome.trim(),
      cpf: numeros(form.cpf),
      nascimento: normalizarNascimento(form.nascimento),
      email: usuario.email,
      telefone: numeros(form.telefone),
      tipo,
      criadoEm: serverTimestamp(),
    };

    // 4. CAMPOS ESPECÍFICOS DO PSICÓLOGO

    if (tipo === "psicologo") {
      perfil.crp = form.crp.trim();
      perfil.status = "pendente";

      perfil.endereco = informarEndereco
        ? {
            cep: numeros(form.cep),
            rua: form.rua.trim(),
            numero: form.numero.trim(),
            complemento: form.complemento.trim(),
            bairro: form.bairro.trim(),
            cidade: form.cidade.trim(),
            uf: form.uf.trim().toUpperCase(),
          }
        : null;
    }

    // 5. SALVAR DOCUMENTO ORIGINAL

    await setDoc(referencia, perfil);

    // ==================================================
    // NOVO: ÍNDICE DE PACIENTES
    // ==================================================

    if (tipo === "paciente") {
      const nome = perfil.nome;

      const pacienteBusca = {
        uid: usuario.uid,
        nome,
        nomeBusca: normalizarNomeBusca(nome),
      };

      try {
        await setDoc(
          doc(db, "pacientesBusca", usuario.uid),
          pacienteBusca
        );

        console.log(
          "Paciente adicionado à busca da Elora."
        );
      } catch (erroIndice) {
        // Não desfaz o cadastro original.
        // A indexação poderá ser refeita
        // pelo processo de migração.

        console.error(
          "Erro ao indexar paciente:",
          erroIndice
        );
      }
    }

  } finally {
    // Mantém o comportamento atual do cadastro:
    // encerrar a sessão após salvar.

    if (usuario) {
      await signOut(auth);
    }
  }
}

// ======================================================
// MENSAGENS DE ERRO DO CADASTRO
// ======================================================

export function mensagemErroCadastro(erro) {
  switch (erro.code) {
    case "permission-denied":
      return (
        "O Firestore recusou o perfil. " +
        "Confira se publicou as regras necessárias."
      );

    case "auth/invalid-credential":
    case "auth/wrong-password":
      return (
        "Não foi possível continuar com esse e-mail e senha. " +
        "Confira os dados."
      );

    case "auth/weak-password":
      return "Escolha uma senha mais forte.";

    case "auth/operation-not-allowed":
      return (
        "Habilite E-mail/senha no Firebase Authentication."
      );

    case "auth/network-request-failed":
    case "unavailable":
      return (
        "Falha de conexão. " +
        "Tente novamente com o mesmo e-mail e senha."
      );

    default:
      return erro.code
        ? "Não foi possível concluir o cadastro."
        : erro.message;
  }
}