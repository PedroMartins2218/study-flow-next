// Canal de contato do Nexo Study — fonte única.
//
// Mudou o endereço? Muda só aqui. Ele aparece no rodapé da landing e nas duas
// páginas legais, e é por onde a pessoa exerce os direitos que a LGPD garante
// (acesso, correção e exclusão dos dados). Documento legal que promete um canal
// inexistente é promessa quebrada — por isso o endereço vive num só lugar, em
// vez de repetido em quatro arquivos.

export const EMAIL_SUPORTE = "suportenexostudy@gmail.com";

/** Link pronto para `href`, com assunto preenchido. */
export function mailtoSuporte(assunto?: string): string {
  const base = `mailto:${EMAIL_SUPORTE}`;
  return assunto ? `${base}?subject=${encodeURIComponent(assunto)}` : base;
}
