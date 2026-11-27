// Espelha o scan-community-package do n8n (@n8n/scan-community-package,
// buildScanConfig): presets nodes/credentials do eslint-plugin-n8n-nodes-base
// com as mesmas exceções. Lint verde aqui = mesmo veredito do scan na publicação.
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: { sourceType: "module", extraFileExtensions: [".json"] },
  plugins: ["eslint-plugin-n8n-nodes-base"],
  extends: ["plugin:n8n-nodes-base/community"],
  rules: { "no-console": "error" },
  overrides: [
    {
      files: ["credentials/**/*.ts"],
      extends: ["plugin:n8n-nodes-base/credentials"],
      rules: {
        "n8n-nodes-base/cred-class-field-documentation-url-miscased": "off",
        "n8n-nodes-base/cred-class-field-type-options-password-missing": "off"
      }
    },
    {
      files: ["nodes/**/*.ts"],
      extends: ["plugin:n8n-nodes-base/nodes"],
      rules: {
        "n8n-nodes-base/node-class-description-inputs-wrong-regular-node": "off",
        "n8n-nodes-base/node-class-description-outputs-wrong": "off",
        "n8n-nodes-base/node-param-type-options-max-value-present": "off"
      }
    }
  ]
};
