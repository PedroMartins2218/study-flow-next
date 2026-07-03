"use client";

import { useCallback } from "react";
import {
  alternarTrabalho,
  criarTrabalho,
  removerTrabalho,
  subscribeToTrabalhos,
} from "@/lib/data/trabalhos";
import { TelaTarefas, type Tarefa } from "@/components/tarefas/TelaTarefas";

export default function TrabalhosPage() {
  const subscribe = useCallback(
    (uid: string, onChange: (itens: Tarefa[]) => void) =>
      subscribeToTrabalhos(uid, (trabalhos) =>
        onChange(
          trabalhos.map((t) => ({
            id: t.id,
            titulo: t.titulo,
            materia: t.materia,
            data: t.data,
            feita: t.concluido,
          }))
        )
      ),
    []
  );

  return (
    <TelaTarefas
      entidade="trabalhos"
      titulo="Trabalhos"
      subtitulo="Entregas e trabalhos escolares, organizados por prazo."
      rotuloNovo="Novo trabalho"
      rotuloVazio="Nenhum trabalho ainda"
      descricaoVazio="Cadastre os trabalhos e entregas para não perder nenhum prazo."
      placeholderTitulo="Ex.: Trabalho de biologia"
      subscribe={subscribe}
      criar={criarTrabalho}
      alternar={alternarTrabalho}
      remover={removerTrabalho}
    />
  );
}
