import {
  applicationDefault,
  initializeApp,
} from "firebase-admin/app";

import {
  getFirestore,
} from "firebase-admin/firestore";

// ======================================================
// FIREBASE ADMIN — EXECUÇÃO LOCAL
// ======================================================

initializeApp({
  credential: applicationDefault(),
  projectId: "elora-tcc",
});

const db = getFirestore();

function normalizar(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// ======================================================
// BUSCAR USUÁRIOS DO TIPO PACIENTE
// ======================================================

const usuarios = await db
  .collection("usuarios")
  .where("tipo", "==", "paciente")
  .get();

let total = 0;
let pendentes = 0;

let lote = db.batch();

for (const documento of usuarios.docs) {
  const dados = documento.data();

  if (
    typeof dados.nome !== "string" ||
    dados.nome.trim().length < 2
  ) {
    continue;
  }

  const nome = dados.nome.trim();

  // Somente os dados mínimos necessários
  // para exibição na busca.
  const dadosMinimos = {
    uid: documento.id,
    nome,
    nomeBusca: normalizar(nome),
  };

  if (
    typeof dados.fotoURL === "string" &&
    dados.fotoURL.startsWith("https://")
  ) {
    dadosMinimos.fotoURL = dados.fotoURL;
  }

  const referencia = db
    .collection("pacientesBusca")
    .doc(documento.id);

  lote.set(referencia, dadosMinimos, {
    merge: true,
  });

  total++;
  pendentes++;

  // Trabalhar em lotes menores.
  if (pendentes === 400) {
    await lote.commit();

    lote = db.batch();
    pendentes = 0;
  }
}

if (pendentes > 0) {
  await lote.commit();
}

console.log(
  `Migração concluída: ${total} paciente(s) indexado(s).`
);