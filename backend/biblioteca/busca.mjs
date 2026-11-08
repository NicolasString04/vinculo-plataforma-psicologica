import { CONHECIMENTOS } from "./conhecimentos.mjs";
import { fontePublica } from "./fontes.mjs";

export function normalizar(texto = "") {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function pontuacao(item, texto) {
  const t = normalizar(texto);
  const palavras = t.match(/[a-z]{3,}/g) ?? [];

  return item.termos.reduce((soma, termo) => {
    const alvo = normalizar(termo);

    if (t.includes(alvo)) {
      return soma + (alvo.includes(" ") ? 4 : 3);
    }

    const radical = alvo.slice(
      0,
      Math.min(5, alvo.length)
    );

    return (
      soma +
      (palavras.some((p) => p.startsWith(radical)) ? 1 : 0)
    );
  }, 0);
}

export function buscarConhecimento(texto, limite = 4) {
  const ordenados = CONHECIMENTOS
    .filter((item) => item.id !== "escuta-aberta")

    .map((item) => ({
      item,
      pontos: pontuacao(item, texto),
    }))

    .filter((entrada) => entrada.pontos > 0)

    .sort((a, b) => b.pontos - a.pontos)

    .slice(
      0,
      Math.min(5, Math.max(1, limite))
    )

    .map(({ item }) => item);

  return [
    CONHECIMENTOS.find(
      (item) => item.id === "escuta-aberta"
    ),
    ...ordenados,
  ];
}

export function fontesDisponibilizadas(conhecimentos) {
  return [
    ...new Set(
      conhecimentos.flatMap(
        (item) => item.fontesRelacionadas
      )
    ),
  ]
    .map(fontePublica)
    .filter(Boolean);
}