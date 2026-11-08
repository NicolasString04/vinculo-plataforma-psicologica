// Catálogo bibliográfico.
// Não contém cópias integrais dos manuais.
// A revisão científica ainda está pendente.

export const FONTES = Object.freeze({
  dsm5tr: {
    id: "dsm5tr",
    titulo: "DSM-5-TR",
    autor: "American Psychiatric Association",
    tipo: "manual protegido por direitos autorais",
    url: "https://www.psychiatry.org/patients-families/what-is-the-dsm/",
    papel:
      "Referência bibliográfica para estudo de descrições clínicas; não contém critérios reproduzidos.",
    status:
      "referência catalogada; conteúdo específico ainda não incorporado nem validado",
    localizador: null,
    revisadoPor: null,
  },

  cid11: {
    id: "cid11",
    titulo: "CID-11 / CDDR",
    autor: "Organização Mundial da Saúde",
    tipo: "classificação e descrições clínicas",
    url: "https://www.who.int/publications/i/item/9789240077263",
    papel:
      "Referência para terminologia e descrições clínicas; sem atribuição automática de códigos.",
    status:
      "referência catalogada; excertos específicos ainda não incorporados nem validados",
    localizador: null,
    revisadoPor: null,
  },

  benjamin: {
    id: "benjamin",
    titulo: "A Entrevista de Ajuda",
    autor: "Alfred Benjamin",
    tipo: "obra protegida por direitos autorais",
    url: null,
    papel:
      "Referência metodológica para escuta, esclarecimento e perguntas abertas.",
    status:
      "referência catalogada; edição, páginas e conteúdo ainda pendentes de conferência",
    localizador: null,
    revisadoPor: null,
  },

  mhgap: {
    id: "mhgap",
    titulo: "mhGAP Intervention Guide / recursos da OMS",
    autor: "Organização Mundial da Saúde",
    tipo: "material público de referência",
    url: "https://www.who.int/teams/mental-health-and-substance-use/treatment-care/mental-health-gap-action-programme",
    papel:
      "Contextualização de cuidados e encaminhamento em saúde mental.",
    status:
      "referência pública catalogada; adaptação clínica pendente de revisão",
    localizador: null,
    revisadoPor: null,
  },

  nimh_ansiedade: {
    id: "nimh_ansiedade",
    titulo: "Anxiety Disorders",
    autor: "National Institute of Mental Health (NIMH)",
    tipo: "informação pública de saúde",
    url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
    papel:
      "Contextualização geral de preocupações e experiências associadas à ansiedade.",
    status:
      "referência pública catalogada; adaptação clínica pendente de revisão",
    localizador: null,
    revisadoPor: null,
  },

  nimh_depressao: {
    id: "nimh_depressao",
    titulo: "Depression",
    autor: "National Institute of Mental Health (NIMH)",
    tipo: "informação pública de saúde",
    url: "https://www.nimh.nih.gov/health/topics/depression",
    papel:
      "Contextualização geral de humor, interesse e outras experiências relatadas.",
    status:
      "referência pública catalogada; adaptação clínica pendente de revisão",
    localizador: null,
    revisadoPor: null,
  },

  oms_suicidio: {
    id: "oms_suicidio",
    titulo: "Suicide",
    autor: "Organização Mundial da Saúde",
    tipo: "informação pública de saúde",
    url: "https://www.who.int/news-room/fact-sheets/detail/suicide",
    papel:
      "Referência contextual para a elaboração futura de protocolo de segurança.",
    status:
      "referência catalogada; NÃO representa protocolo validado",
    localizador: null,
    revisadoPor: null,
  },
});

export function fontePublica(id) {
  const f = FONTES[id];

  return f
    ? {
        id: f.id,
        titulo: f.titulo,
        autor: f.autor,
        url: f.url,
        status: f.status,
      }
    : null;
}