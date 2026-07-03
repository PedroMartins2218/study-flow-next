"use client";

import { useCallback } from "react";
import {
  alternarAtividade,
  criarAtividade,
  removerAtividade,
  subscribeToAtividades,
} from "@/lib/data/atividades";
import { TelaTarefas, type Tarefa } from "@/components/tarefas/TelaTarefas";

export default function AtividadesPage() {
  const subscribe = useCallback(
    (uid: string, onChange: (itens: Tarefa[]) => void) =>
      subscribeToAtividades(uid, (atividades) =>
        onChange(
          atividades.map((a) => ({
            id: a.id,
            titulo: a.titulo,
            materia: a.materia,
            data: a.data,
            feita: a.concluida,
          }))
        )
      ),
    []
  );

  return (
    <TelaTarefas
      entidade="atividades"
      titulo="Atividades de estudo"
      subtitulo="O que precisa ser feito hoje e nos próximos dias."
      rotuloNovo="Nova atividade"
      rotuloVazio="Nenhuma atividade ainda"
      descricaoVazio="Adicione o que você precisa estudar e acompanhe pelo prazo."
      placeholderTitulo="Ex.: Resolver lista de exercícios"
      subscribe={subscribe}
      criar={criarAtividade}
      alternar={alternarAtividade}
      remover={removerAtividade}
    />
  );
}
