import { normalizar } from "./biblioteca/busca.mjs";

export const AVISO =
  "Esta triagem não substitui uma avaliação realizada por um psicólogo e não constitui diagnóstico psicológico ou psiquiátrico.";

export const AVISO_TESTE =
  "Protótipo acadêmico NÃO validado para uso clínico. Utilize exclusivamente relatos fictícios. Não há monitoramento nem contato automático com profissionais.";

export const ORIENTACAO_CRITICA =
  "Sinto muito que você esteja passando por isso. Esta ferramenta não consegue oferecer ajuda de emergência nem avisar um profissional. Se houver risco imediato, procure um serviço de emergência ou ligue 192 (SAMU). Você também pode conversar com o CVV pelo 188, no Brasil, e buscar alguém de confiança para estar com você agora.";

// Heurística experimental e incompleta.
// Não substitui avaliação humana de risco.

const PADROES_RISCO = [
  /\b(quero|vou|penso em|pensando em|pretendo|planejo)\s+(me\s+)?(matar|suicidar)\b/,

  /\b(quero|vou|penso em|pretendo)\s+(acabar com a minha vida|tirar minha vida|morrer)\b/,

  /\bnao quero mais viver\b/,

  /\b(quero|vou|penso em|pretendo)\s+(me\s+)?(cortar|machucar|ferir)\b/,

  /\b(me matar|suicidio|autoagressao|automutilacao)\b/,
];

export function sinalDeRisco(texto) {
  const normalizado = normalizar(texto);

  return PADROES_RISCO.some((padrao) =>
    padrao.test(normalizado)
  );
}