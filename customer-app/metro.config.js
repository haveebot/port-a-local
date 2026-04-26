// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Let Metro see the website's shared data files (single source of truth
// for businesses, categories, delivery menu, etc.) without copying.
config.watchFolders = [path.resolve(repoRoot, "src", "data")];

// Look in this project's node_modules first, then let Metro walk up
// (hierarchical lookup stays enabled). Strict isolation breaks because
// peer deps like expo-asset and @react-native/virtualized-lists get
// hoisted to the repo root by npm dedupe.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(repoRoot, "node_modules"),
];

// Map `@palocal/data/*` to the website's `src/data/*` so both apps and
// the website can share the same files. Mirrored in tsconfig paths.
config.resolver.extraNodeModules = {
  "@palocal/data": path.resolve(repoRoot, "src", "data"),
};

module.exports = config;
