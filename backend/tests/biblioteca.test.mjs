import test from "node:test";
import assert from "node:assert/strict";

import {
  buscarConhecimento,
  fontesDisponibilizadas,
} from "../biblioteca/busca.mjs";

import {
  sinalDeRisco,
  AVISO,
} from "../seguranca.mjs";

import {
  FONTES,
} from "../biblioteca/fontes.mjs";

test(
  "relato livre sobre luto recupera conteúdo pertinente",
  () => {
    const ids = buscarConhecimento(
      "Perdi minha avó e sinto saudade"
    ).map((item) => item.id);

    assert.ok(
      ids.includes("perdas-mudancas")
    );
  }
);

test(
  "relato de sono recupera sono sem impor categoria fixa",
  () => {
    const ids = buscarConhecimento(
      "Não consigo dormir bem"
    ).map((item) => item.id);

    assert.ok(
      ids.includes("sono-descanso")
    );
  }
);

test(
  "a biblioteca retorna somente fontes cadastradas",
  () => {
    const fontes = fontesDisponibilizadas(
      buscarConhecimento("Estou triste")
    );

    assert.ok(
      fontes.every(
        (fonte) => fonte.id in FONTES
      )
    );
  }
);

test(
  "biblioteca não inclui texto integral nem critérios do DSM",
  () => {
    assert.match(
      FONTES.dsm5tr.status,
      /ainda não incorporado/
    );
  }
);

test(
  "sinal de risco explícito recebe alerta conservador",
  () => {
    assert.equal(
      sinalDeRisco(
        "Eu não quero mais viver"
      ),
      true
    );

    assert.equal(
      sinalDeRisco(
        "Vou me matar"
      ),
      true
    );
  }
);

test(
  "um relato genérico não é marcado como crise pela heurística",
  () => {
    assert.equal(
      sinalDeRisco(
        "Estou preocupado com a faculdade"
      ),
      false
    );
  }
);

test(
  "aviso não diagnóstico está definido pelo servidor",
  () => {
    assert.match(
      AVISO,
      /não substitui/
    );
  }
);