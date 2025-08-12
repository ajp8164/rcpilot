const config = {
  arrowParens: 'avoid',
  bracketSameLine: true,
  bracketSpacing: true,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  // importOrder: ['^@core/(.*)$', '^@server/(.*)$', '^@ui/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderGroupNamespaceSpecifiers: true,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
};

export default config;
