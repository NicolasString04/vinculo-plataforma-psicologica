import test from "node:test";
import assert from "node:assert/strict";

// Força o modo de demonstração antes de carregar o servidor.
process.env.ELORA_MODO = "demo";

const { criarServidor } = await import(
  "../server.mjs"
);

const servidor = criarServidor();

await new Promise((resolve) =>
  servidor.listen(
    0,
    "127.0.0.1",
    resolve
  )
);

const base = `http://127.0.0.1:${
  servidor.address().port
}`;

async function post(rota, dados) {
  const resposta = await fetch(
    base + rota,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(dados),
    }
  );

  return {
    status: resposta.status,
    body: await resposta.json(),
  };
}

test(
  "fluxo fictício: iniciar, conversar e gerar resumo",
  async () => {
    const inicio = await post(
      "/api/triagem/iniciar",
      {}
    );

    assert.equal(
      inicio.status,
      200
    );

    assert.equal(
      inicio.body.modo,
      "demo"
    );

    const turno = await post(
      "/api/triagem/mensagem",
      {
        sessaoId:
          inicio.body.sessaoId,

        texto:
          "Fico triste quando penso na faculdade",
      }
    );

    assert.equal(
      turno.body.tipo,
      "pergunta"
    );

    const final = await post(
      "/api/triagem/finalizar",
      {
        sessaoId:
          inicio.body.sessaoId,
      }
    );

    assert.equal(
      final.status,
      200
    );

    assert.ok(
      final.body.aviso.includes(
        "psicólogo"
      )
    );

    assert.ok(
      final.body.fontes.length > 0
    );
  }
);

test(
  "fluxo de risco: interrompe a triagem e impede resumo",
  async () => {
    const inicio = await post(
      "/api/triagem/iniciar",
      {}
    );

    const risco = await post(
      "/api/triagem/mensagem",
      {
        sessaoId:
          inicio.body.sessaoId,

        texto:
          "Eu não quero mais viver",
      }
    );

    assert.equal(
      risco.body.tipo,
      "risco"
    );

    assert.match(
      risco.body.mensagem,
      /188/
    );

    const final = await post(
      "/api/triagem/finalizar",
      {
        sessaoId:
          inicio.body.sessaoId,
      }
    );

    assert.equal(
      final.status,
      403
    );
  }
);

test(
  "recusa texto muito longo",
  async () => {
    const inicio = await post(
      "/api/triagem/iniciar",
      {}
    );

    const resposta = await post(
      "/api/triagem/mensagem",
      {
        sessaoId:
          inicio.body.sessaoId,

        texto:
          "x".repeat(1900),
      }
    );

    assert.equal(
      resposta.status,
      400
    );
  }
);

test.after(
  () =>
    new Promise((resolve) =>
      servidor.close(resolve)
    )
);