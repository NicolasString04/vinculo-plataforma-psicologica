
import {
  Navigate,
  useLocation,
} from "react-router-dom";

// =====================================================
// COMPATIBILIDADE COM A ROTA ANTIGA
//
// /triagem/concluida
//         ↓
// /triagem/resumo
//
// Preserva o estado de navegação, se existir.
// =====================================================

export function PosTriagem() {
  const location = useLocation();

  return (
    <Navigate
      to="/triagem/resumo"
      replace
      state={location.state ?? null}
    />
  );
}
