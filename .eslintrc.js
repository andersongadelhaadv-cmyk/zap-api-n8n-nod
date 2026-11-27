module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: { sourceType: "module", extraFileExtensions: [".json"] },
  plugins: ["eslint-plugin-n8n-nodes-base"],
  extends: ["plugin:n8n-nodes-base/community"],
  // O scan-community-package do n8n aplica esta regra; o preset community não.
  rules: { "n8n-nodes-base/node-param-description-missing-final-period": "error" }
};
