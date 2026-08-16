"use client";

import { useCallback } from "react";
import {
  atualizarTrabalho,
  criarTrabalho,
  moverTrabalho,
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
            situacao: t.situacao,
          }))
        )
      ),
    []
  );

  return (
    <TelaTarefas
      entidade="trabalhos"
      titulo="Trabalhos"
      subtitulo="Arraste entre as etapas até a entrega."
      rotuloNovo="Novo trabalho"
      rotuloVazio="Nenhum trabalho ainda"
      descricaoVazio="Cadastre os trabalhos e entregas para não perder nenhum prazo."
      placeholderTitulo="Ex.: Trabalho de biologia"
      rotuloFeito="Entregue"
      subscribe={subscribe}
      criar={criarTrabalho}
      atualizar={atualizarTrabalho}
      mover={moverTrabalho}
      remover={removerTrabalho}
    />
  );
}
