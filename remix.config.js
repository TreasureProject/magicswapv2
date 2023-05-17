/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  tailwind: true,
  future: {
    v2_errorBoundary: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
  serverDependenciesToBundle: [
    "@rainbow-me/rainbowkit",
    "@rainbow-me/rainbowkit/wallets",
    /^@?wagmi.*/,
  ],
  serverModuleFormat: "cjs",
};
