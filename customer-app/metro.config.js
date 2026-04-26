// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Let Metro see the website's shared data files (single source of truth
// for businesses, categories, delivery menu, etc.) without copying.
config.watchFolders = [path.resolve(repoRoot, "src", "data")];

// Resolve modules from this project first, then walk up. This keeps
// React Native / Expo from accidentally picking up the website's
// node_modules (which has Next.js's React, etc.).
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
];
config.resolver.disableHierarchicalLookup = true;

// Map `@palocal/data/*` to the website's `src/data/*` so both apps and
// the website can share the same files. Mirrored in tsconfig paths.
config.resolver.extraNodeModules = {
  "@palocal/data": path.resolve(repoRoot, "src", "data"),
};

module.exports = config;
