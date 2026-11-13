import FormularioCadastroElora from "./FormularioCadastroElora";
import {
  cadastrarNoFirebase,
  mensagemErroCadastro,
} from "../services/cadastroFirebase";

export default function CadastroPsicologo() {
  async function cadastrarPsicologo(dados) {
    await cadastrarNoFirebase(dados, "psicologo");
  }

  return (
    <FormularioCadastroElora
      profissional
      onCadastrar={cadastrarPsicologo}
      mensagemErro={mensagemErroCadastro}
      mensagemSucesso="Seu cadastro profissional foi recebido. A verificação do CRP está pendente."
    />
  );
}