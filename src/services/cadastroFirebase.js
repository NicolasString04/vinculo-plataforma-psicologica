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

const numeros = (valor) => valor.replace(/\D/g, "");

function normalizarNascimento(valor) {
  // Aceita o campo com máscara do Git e o input type="date".
  if (valor.includes("/")) {
    const [dia, mes, ano] = valor.split("/");
    return `${ano}-${mes}-${dia}`;
  }

  return valor;
}

export async function cadastrarNoFirebase(
  form,
  tipo,
  informarEndereco = false,
) {
  const email = form.email.trim().toLowerCase();
  let usuario;

  try {
    try {
      const resultado = await createUserWithEmailAndPassword(
        auth,
        email,
        form.senha,
      );
      usuario = resultado.user;
    } catch (erro) {
      // Permite retomar se a conta foi criada antes, mas faltou salvar o perfil.
      if (erro.code !== "auth/email-already-in-use") throw erro;

      const resultado = await signInWithEmailAndPassword(
        auth,
        email,
        form.senha,
      );
      usuario = resultado.user;
    }

    const referencia = doc(db, "usuarios", usuario.uid);
    const existente = await getDocFromServer(referencia);

    if (existente.exists()) {
      throw new Error(
        "Este e-mail já tem um perfil no Elora. Use a tela de login.",
      );
    }

    const perfil = {
      nome: form.nome.trim(),
      cpf: numeros(form.cpf),
      nascimento: normalizarNascimento(form.nascimento),
      email: usuario.email,
      telefone: numeros(form.telefone),
      tipo,
      criadoEm: serverTimestamp(),
    };

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

    await setDoc(referencia, perfil);
  } finally {
    // O cadastro termina na própria tela enquanto os logins são demonstrativos.
    if (usuario) await signOut(auth);
  }
}

export function mensagemErroCadastro(erro) {
  switch (erro.code) {
    case "permission-denied":
      return "O Firestore recusou o perfil. Confira se publicou as regras novas. Se a conta já foi criada, tente novamente com o mesmo e-mail e senha.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Não foi possível continuar com esse e-mail e senha. Confira os dados.";
    case "auth/weak-password":
      return "Escolha uma senha mais forte.";
    case "auth/operation-not-allowed":
      return "Habilite E-mail/senha no Firebase Authentication.";
    case "auth/network-request-failed":
    case "unavailable":
      return "Falha de conexão. Tente novamente com o mesmo e-mail e senha.";
    default:
      return erro.code
        ? "Não foi possível concluir o cadastro."
        : erro.message;
  }
}