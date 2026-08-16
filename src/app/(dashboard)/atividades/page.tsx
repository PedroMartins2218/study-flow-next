"use client";

import { useCallback } from "react";
import {
  atualizarAtividade,
  criarAtividade,
  moverAtividade,
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
            situacao: a.situacao,
          }))
        )
      ),
    []
  );

  return (
    <TelaTarefas
      entidade="atividades"
      titulo="Atividades de estudo"
      subtitulo="Arraste entre as etapas para acompanhar o que está em andamento."
      rotuloNovo="Nova atividade"
      rotuloVazio="Nenhuma atividade ainda"
      descricaoVazio="Adicione o que você precisa estudar e acompanhe pelo prazo."
      placeholderTitulo="Ex.: Resolver lista de exercícios"
      rotuloFeito="Concluído"
      subscribe={subscribe}
      criar={criarAtividade}
      atualizar={atualizarAtividade}
      mover={moverAtividade}
      remover={removerAtividade}
    />
  );
}
