import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin (e suas dependências, como jose/jwks-rsa) não deve ser
  // empacotado pelo bundler — precisa ser carregado do node_modules em runtime,
  // senão quebra com ERR_REQUIRE_ESM no ambiente serverless.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
