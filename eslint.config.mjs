import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  {
    ignores: ["android/**", "out/**", ".next/**"]
  },
  ...nextVitals,
  ...nextTs
];

export default config;
