
import FormularioCadastroElora from "./FormularioCadastroElora";
import {
  cadastrarNoFirebase,
  mensagemErroCadastro,
} from "../services/cadastroFirebase";

export default function Cadastro() {
  async function cadastrarPaciente(dados) {
    await cadastrarNoFirebase(dados, "paciente");
  }

  return (
    <FormularioCadastroElora
      onCadastrar={cadastrarPaciente}
      mensagemErro={mensagemErroCadastro}
      mensagemSucesso="Sua conta e seu perfil de paciente foram salvos."
    />
  );
}
