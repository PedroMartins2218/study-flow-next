"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { updateProfile } from "firebase/auth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { usePerfil } from "@/lib/perfil/PerfilProvider";
import { salvarFotoPerfil, removerFotoPerfil } from "@/lib/data/perfil";
import { useToast } from "@/components/ui/Toast";
import {
  lerPrefs,
  salvarPrefs,
  type PrefsLembretes,
  PREFS_PADRAO,
} from "@/lib/data/lembretes";

type Tema = "claro" | "escuro";

function aplicarTema(tema: Tema) {
  document.documentElement.classList.toggle("dark", tema === "escuro");
  localStorage.setItem("sf_tema", tema);
}

function iniciais(nome: string | null | undefined, email: string | null | undefined) {
  const base = (nome ?? email ?? "?").trim();
  const partes = base.split(/[\s@.]+/).filter(Boolean);
  return (partes[0]?.[0] ?? "?").toUpperCase() + (partes[1]?.[0]?.toUpperCase() ?? "");
}

// Reduz a imagem para um quadrado de 160px e devolve uma data URL JPEG leve.
function processarFoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const size = 160;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        const menor = Math.min(img.width, img.height);
        const sx = (img.width - menor) / 2;
        const sy = (img.height - menor) / 2;
        ctx.drawImage(img, sx, sy, menor, menor, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("imagem inválida"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const { foto } = usePerfil();
  const toast = useToast();
  const [tema, setTema] = useState<Tema>("claro");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [prefs, setPrefs] = useState<PrefsLembretes>(PREFS_PADRAO);
  const [permBloqueada, setPermBloqueada] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setTema(localStorage.getItem("sf_tema") === "escuro" ? "escuro" : "claro");
      setPrefs(lerPrefs());
      if (typeof Notification !== "undefined" && Notification.permission === "denied") {
        setPermBloqueada(true);
      }
    });
  }, []);

  function handleTema(novo: Tema) {
    setTema(novo);
    aplicarTema(novo);
  }

  async function handleSalvarNome(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setErro("");
    setSalvando(true);
    const form = new FormData(e.currentTarget);
    const nome = String(form.get("nome") ?? "").trim();
    try {
      if (!nome) {
        setErro("Informe um nome.");
        return;
      }
      await updateProfile(user, { displayName: nome });
      toast("Nome atualizado");
    } catch {
      setErro("Não foi possível salvar o nome agora.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    setEnviandoFoto(true);
    try {
      const dataUrl = await processarFoto(file);
      await salvarFotoPerfil(user.uid, dataUrl);
      toast("Foto atualizada");
    } catch {
      toast("Não foi possível usar essa imagem", "erro");
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function handleRemoverFoto() {
    if (!user) return;
    await removerFotoPerfil(user.uid);
    toast("Foto removida");
  }

  async function atualizarPrefs(novas: PrefsLembretes) {
    // Ao ativar, pede permissão de notificação do navegador.
    if (novas.ativo && typeof Notification !== "undefined") {
      if (Notification.permission === "default") {
        const p = await Notification.requestPermission();
        if (p !== "granted") {
          setPermBloqueada(p === "denied");
          novas = { ...novas, ativo: false };
          toast("Permita as notificações do navegador para ativar", "erro");
        }
      } else if (Notification.permission === "denied") {
        setPermBloqueada(true);
        novas = { ...novas, ativo: false };
        toast("As notificações estão bloqueadas no navegador", "erro");
      }
    }
    setPrefs(novas);
    salvarPrefs(novas);
  }

  function testarNotificacao() {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") {
      toast("Ative os lembretes primeiro", "erro");
      return;
    }
    try {
      new Notification("Study Flow", { body: "Tudo certo! Você vai receber lembretes assim." });
    } catch {
      toast("Não foi possível enviar agora", "erro");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900">Configurações</h1>
      <p className="mt-1 text-sm text-slate-500">
        Preferências da sua conta e do aplicativo.
      </p>

      {/* Perfil */}
      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-700">Perfil</h2>

        <div className="mt-4 flex items-center gap-4">
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto} alt="" className="h-16 w-16 rounded-full object-cover ring-1 ring-slate-200" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
              {iniciais(user?.displayName, user?.email)}
            </span>
          )}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={enviandoFoto}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                {enviandoFoto ? "Enviando..." : foto ? "Trocar foto" : "Adicionar foto"}
              </button>
              {foto && (
                <button
                  onClick={handleRemoverFoto}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                >
                  Remover
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400">JPG ou PNG. A imagem é reduzida automaticamente.</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFoto}
            className="hidden"
          />
        </div>

        <p className="mt-4 text-xs text-slate-500">{user?.email}</p>
        <form onSubmit={handleSalvarNome} className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            name="nome"
            defaultValue={user?.displayName ?? ""}
            placeholder="Seu nome de exibição"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar nome"}
          </button>
        </form>
        {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
      </div>

      {/* Notificações */}
      <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-700">Notificações</h2>
        <p className="mt-1 text-xs text-slate-500">
          Receba lembretes de provas, atividades e trabalhos ao abrir o Study Flow.
        </p>

        <label className="mt-4 flex cursor-pointer items-center justify-between gap-3">
          <span className="text-sm text-slate-700">Ativar lembretes</span>
          <input
            type="checkbox"
            checked={prefs.ativo}
            onChange={(e) => atualizarPrefs({ ...prefs, ativo: e.target.checked })}
            className="h-4 w-4"
          />
        </label>

        {prefs.ativo && (
          <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
            {(
              [
                ["provas", "Provas e simulados"],
                ["atividades", "Atividades"],
                ["trabalhos", "Trabalhos"],
              ] as const
            ).map(([chave, rotulo]) => (
              <label key={chave} className="flex cursor-pointer items-center justify-between gap-3">
                <span className="text-sm text-slate-600">{rotulo}</span>
                <input
                  type="checkbox"
                  checked={prefs[chave]}
                  onChange={(e) => atualizarPrefs({ ...prefs, [chave]: e.target.checked })}
                  className="h-4 w-4"
                />
              </label>
            ))}
            <button
              onClick={testarNotificacao}
              className="mt-2 self-start rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Enviar notificação de teste
            </button>
          </div>
        )}

        {permBloqueada && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            As notificações estão bloqueadas para este site no seu navegador. Libere-as nas
            configurações do navegador para ativar os lembretes.
          </p>
        )}
        <p className="mt-3 text-xs text-slate-400">
          Os lembretes chegam quando você abre o app. Avisos com o app fechado virão em uma
          próxima atualização.
        </p>
      </div>

      {/* Aparência */}
      <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-700">Aparência</h2>
        <p className="mt-1 text-xs text-slate-500">Escolha entre o tema claro e o escuro.</p>
        <div className="mt-4 flex gap-2 rounded-lg bg-slate-100 p-1 text-sm font-medium sm:max-w-xs">
          <button
            onClick={() => handleTema("claro")}
            className={`flex-1 rounded-md py-2 transition ${
              tema === "claro" ? "bg-white text-slate-900 shadow" : "text-slate-500"
            }`}
          >
            Claro
          </button>
          <button
            onClick={() => handleTema("escuro")}
            className={`flex-1 rounded-md py-2 transition ${
              tema === "escuro" ? "bg-white text-slate-900 shadow" : "text-slate-500"
            }`}
          >
            Escuro
          </button>
        </div>
      </div>
    </div>
  );
}
