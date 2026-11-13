import "./RequisitosSenha.css";

const especiais = "^$*.[]{}()?\"!@#%&/\\,><':;|_~";

export const requisitosSenha = [
  { id: "tamanho", texto: "Pelo menos 8 caracteres", atende: (senha) => senha.length >= 8 },
  { id: "maiuscula", texto: "Uma letra maiúscula", atende: (senha) => /[A-Z]/.test(senha) },
  { id: "minuscula", texto: "Uma letra minúscula", atende: (senha) => /[a-z]/.test(senha) },
  { id: "numero", texto: "Um número", atende: (senha) => /[0-9]/.test(senha) },
  {
    id: "especial",
    texto: "Um caractere especial, como !, @ ou #",
    atende: (senha) => [...senha].some((caractere) => especiais.includes(caractere)),
  },
];

export default function RequisitosSenha({ senha }) {
  const total = requisitosSenha.filter(({ atende }) => atende(senha)).length;

  return (
    <div className="requisitos-senha" id="cadastro-requisitos-senha">
      <p className="requisitos-senha-titulo">
        <strong>Sua senha precisa ter</strong>
        <span role="status">{total} de {requisitosSenha.length} requisitos atendidos</span>
      </p>

      <ul>
        {requisitosSenha.map(({ id, texto, atende }) => {
          const concluido = atende(senha);

          return (
            <li key={id} className={concluido ? "requisito-concluido" : undefined}>
              <span className="requisito-icone" aria-hidden="true">
                {concluido ? "✓" : "○"}
              </span>
              <span>{texto}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}