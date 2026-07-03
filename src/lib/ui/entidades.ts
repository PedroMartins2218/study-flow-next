// Identidade visual de cada entidade do sistema: cor de destaque (chip/ícone)
// e o nome do ícone Tabler correspondente. Centralizado aqui para manter as
// telas consistentes. As classes usam tint com opacidade (bg-*-500/10) para
// ficarem legíveis tanto no tema claro quanto no escuro.

export type EntidadeVisual = {
  chip: string; // classes do chip de ícone (fundo + texto)
  ponto: string; // classe de cor para pontinhos/indicadores
  icone: string; // nome do ícone (usado no <Icone/>)
};

export const ENTIDADES: Record<string, EntidadeVisual> = {
  materias: { chip: "bg-blue-500/10 text-blue-600", ponto: "bg-blue-500", icone: "livro" },
  atividades: { chip: "bg-violet-500/10 text-violet-600", ponto: "bg-violet-500", icone: "check" },
  trabalhos: { chip: "bg-amber-500/10 text-amber-600", ponto: "bg-amber-500", icone: "arquivo" },
  provas: { chip: "bg-red-500/10 text-red-600", ponto: "bg-red-500", icone: "calendario" },
  foco: { chip: "bg-emerald-500/10 text-emerald-600", ponto: "bg-emerald-500", icone: "relogio" },
  caderno: { chip: "bg-indigo-500/10 text-indigo-600", ponto: "bg-indigo-500", icone: "caderno" },
};
