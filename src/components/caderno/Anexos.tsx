"use client";

import { useEffect, useState } from "react";
import {
  adicionarAnexo,
  removerAnexo,
  subscribeToAnexos,
  MAX_ANEXOS,
  type Anexo,
} from "@/lib/data/anexos";
import { useToast } from "@/components/ui/Toast";
import {
  comprimirImagem,
  tamanhoDataUrl,
  IMAGEM_ANEXO,
  LIMITE_BYTES_ANEXO,
} from "@/lib/ui/imagem";

// Anexos de imagem de uma anotação (foto do caderno, print de resumo).
// Só aparece na edição: para gravar um anexo é preciso já existir o id da
// anotação, que só existe depois de salvar.
export function Anexos({ uid, anotacaoId }: { uid: string; anotacaoId: string }) {
  const toast = useToast();
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [ampliado, setAmpliado] = useState<Anexo | null>(null);

  useEffect(() => {
    return subscribeToAnexos(uid, anotacaoId, setAnexos);
  }, [uid, anotacaoId]);

  async function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (anexos.length >= MAX_ANEXOS) {
      toast(`Máximo de ${MAX_ANEXOS} imagens por anotação`, "erro");
      return;
    }

    setEnviando(true);
    try {
      const imagem = await comprimirImagem(file, IMAGEM_ANEXO);

      // Rede de segurança: o documento do Firestore tem teto de 1 MB.
      if (tamanhoDataUrl(imagem) > LIMITE_BYTES_ANEXO) {
        toast("Essa imagem ficou grande demais. Tente uma foto menor.", "erro");
        return;
      }

      await adicionarAnexo(uid, anotacaoId, file.name, imagem);
      toast("Imagem anexada");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Não foi possível anexar", "erro");
    } finally {
      setEnviando(false);
    }
  }

  async function handleRemover(anexo: Anexo) {
    try {
      await removerAnexo(uid, anotacaoId, anexo.id);
      toast("Anexo removido");
    } catch {
      toast("Não foi possível remover", "erro");
    }
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="block text-xs font-medium text-slate-500">
          Imagens ({anexos.length}/{MAX_ANEXOS})
        </label>
        {anexos.length < MAX_ANEXOS && (
          <label
            className={`cursor-pointer text-xs font-semibold text-blue-600 transition hover:text-blue-700 ${
              enviando ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {enviando ? "Enviando..." : "+ Anexar imagem"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleArquivo}
            />
          </label>
        )}
      </div>

      {anexos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 px-3 py-3 text-center text-xs text-slate-400">
          Anexe a foto do seu caderno ou de um resumo.
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-2">
          {anexos.map((a) => (
            <li key={a.id} className="group relative">
              <button
                type="button"
                onClick={() => setAmpliado(a)}
                className="block w-full overflow-hidden rounded-lg ring-1 ring-slate-200"
                aria-label={`Ampliar ${a.nome}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.imagem} alt={a.nome} className="h-20 w-full object-cover" />
              </button>
              <button
                type="button"
                onClick={() => handleRemover(a)}
                aria-label={`Remover ${a.nome}`}
                className="absolute right-1 top-1 rounded-md bg-white/90 p-1 text-slate-500 shadow-sm backdrop-blur transition hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Visualização ampliada */}
      {ampliado && (
        <div
          onClick={() => setAmpliado(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={ampliado.nome}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ampliado.imagem}
            alt={ampliado.nome}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </div>
  );
}
