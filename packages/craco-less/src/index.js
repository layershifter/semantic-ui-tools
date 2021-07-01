const {
  getLoader,
  loaderByName,
  removeLoaders,
  throwUnexpectedConfigError
} = require("@craco/craco");
const CracoLessPlugin = require("craco-less");
const path = require("path");

const overrideWebpackConfig = ({ context, pluginOptions, webpackConfig }) => {
  pluginOptions = {lessLoaderOptions: { lessOptions: { math: 'always' } }, ...pluginOptions};

  // add alias to theme.config
  webpackConfig.resolve.alias["../../theme.config$"] = path.join(
    context.paths.appSrc,
    "/semantic-ui/theme.config"
  );

  // file-loader:
  // theme.config, *.variables and *.overrides files should be excluded
  const { isFound, match: fileLoaderMatch } = getLoader(
    webpackConfig,
    loaderByName("file-loader")
  );

  if (!isFound) {
    throwUnexpectedConfigError({
      packageName: "@semantic-ui-react/craco-less",
      message: `Can't find "file-loader" in the ${context.env} webpack config!`
    });
  }

  fileLoaderMatch.loader.exclude.push(/theme.config$/);
  fileLoaderMatch.loader.exclude.push(/\.variables$/);
  fileLoaderMatch.loader.exclude.push(/\.overrides$/);

  // resolve-url-loader:
  // should be removed as it causes bugs
  // https://github.com/Semantic-Org/Semantic-UI-React/issues/3761

  const { hasRemovedAny } = removeLoaders(
    webpackConfig,
    loaderByName("resolve-url-loader")
  );

  if (!hasRemovedAny) {
    throwUnexpectedConfigError({
      packageName: "@semantic-ui-react/craco-less",
      message: `Can't find "resolve-url-loader" in the ${context.env} webpack config!`
    });
  }

  // less-loader:
  // craco-less is reused
  return CracoLessPlugin.overrideWebpackConfig({
    context,
    pluginOptions,
    webpackConfig
  });
};

module.exports = {
  overrideWebpackConfig
};
