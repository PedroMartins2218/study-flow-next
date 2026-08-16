// Compressão de imagem no navegador.
//
// O projeto guarda imagens como data URL dentro do Firestore, de propósito:
// evita o Firebase Storage (que hoje exige plano pago) e mantém o custo zero.
// Em troca, cada imagem precisa caber bem abaixo do limite de 1 MB por
// documento — daí a compressão ser obrigatória, e não um detalhe.

export interface OpcoesImagem {
  /** Largura máxima em pixels. */
  largura: number;
  /** Altura máxima. Se informada junto com `cortar`, a imagem é cortada nessa proporção. */
  altura?: number;
  /** Qualidade do JPEG, de 0 a 1. */
  qualidade?: number;
  /** Corta para preencher exatamente largura×altura (em vez de só redimensionar). */
  cortar?: boolean;
}

/**
 * Lê o arquivo, redimensiona e devolve uma data URL JPEG.
 * Rejeita arquivos que não sejam imagem.
 */
export function comprimirImagem(file: File, opcoes: OpcoesImagem): Promise<string> {
  const { largura, altura, qualidade = 0.7, cortar = false } = opcoes;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Só é possível enviar imagens (JPG, PNG, HEIC...)."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const img = new window.Image();

      img.onload = () => {
        let destinoLargura = largura;
        let destinoAltura = altura ?? Math.round((img.height / img.width) * largura);

        // Sem corte, respeita a proporção original e usa `largura` como teto.
        if (!cortar) {
          const escala = Math.min(1, largura / img.width);
          destinoLargura = Math.round(img.width * escala);
          destinoAltura = Math.round(img.height * escala);
        }

        const canvas = document.createElement("canvas");
        canvas.width = destinoLargura;
        canvas.height = destinoAltura;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Não foi possível processar a imagem."));
          return;
        }

        if (cortar) {
          // Recorta o centro na proporção do destino, sem distorcer.
          const proporcaoDestino = destinoLargura / destinoAltura;
          const proporcaoOrigem = img.width / img.height;
          let sw = img.width;
          let sh = img.height;
          if (proporcaoOrigem > proporcaoDestino) {
            sw = img.height * proporcaoDestino;
          } else {
            sh = img.width / proporcaoDestino;
          }
          const sx = (img.width - sw) / 2;
          const sy = (img.height - sh) / 2;
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, destinoLargura, destinoAltura);
        } else {
          ctx.drawImage(img, 0, 0, destinoLargura, destinoAltura);
        }

        resolve(canvas.toDataURL("image/jpeg", qualidade));
      };

      img.onerror = () => reject(new Error("Arquivo de imagem inválido."));
      img.src = reader.result as string;
    };

    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

/** Tamanho aproximado, em bytes, de uma data URL base64. */
export function tamanhoDataUrl(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.round((base64.length * 3) / 4);
}

// Presets usados no app, para os números ficarem num lugar só.
export const IMAGEM_PERFIL: OpcoesImagem = {
  largura: 160,
  altura: 160,
  qualidade: 0.82,
  cortar: true,
};

/** Capa da matéria: vai no documento, que a lista inteira carrega — comprime forte. */
export const IMAGEM_CAPA: OpcoesImagem = {
  largura: 640,
  altura: 200,
  qualidade: 0.7,
  cortar: true,
};

/** Anexo do caderno: precisa ficar legível (foto de página), mas longe de 1 MB. */
export const IMAGEM_ANEXO: OpcoesImagem = { largura: 1000, qualidade: 0.7 };

/** Teto de segurança por imagem gravada no Firestore. */
export const LIMITE_BYTES_ANEXO = 700_000;
