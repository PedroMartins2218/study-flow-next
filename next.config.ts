import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin (e suas dependências, como jose/jwks-rsa) não deve ser
  // empacotado pelo bundler — precisa ser carregado do node_modules em runtime,
  // senão quebra com ERR_REQUIRE_ESM no ambiente serverless.
  serverExternalPackages: ["firebase-admin"],

  // Só afeta `next dev`: permite testar pelo celular na rede local (o Next
  // bloqueia origens diferentes de localhost por padrão no modo dev, o que
  // deixava a página sem JavaScript — botão de login "morto").
  //
  // O IP da máquina muda quando o roteador renova o DHCP, então a lista guarda
  // os já usados. Se o celular abrir a página mas nada funcionar, é sinal de que
  // o IP mudou de novo: confira com `ipconfig` e acrescente aqui.
  allowedDevOrigins: ["192.168.0.13", "192.168.0.88", "192.168.0.68", "192.168.0.7"],
};

export default nextConfig;
