const {
  loaderByName,
  removeLoaders,
  throwUnexpectedConfigError
} = require("@craco/craco");
const CracoLessPlugin = require("craco-less");
const path = require("path");

const overrideWebpackConfig = ({ context, pluginOptions, webpackConfig }) => {
  pluginOptions = {
    lessLoaderOptions: { lessOptions: { math: "always" } },
    ...pluginOptions
  };

  // add alias to theme.config
  webpackConfig.resolve.alias["../../theme.config$"] = path.join(
    context.paths.appSrc,
    "/semantic-ui/theme.config"
  );

  const oneOfRule = webpackConfig.module.rules.find(rule => rule.oneOf);

  if (!oneOfRule) {
    throwUnexpectedConfigError({
      packageName: "@semantic-ui-react/craco-less",
      message:
        "Can't find a 'oneOf' rule under module.rules in the " +
        `${context.env} webpack config!`
    });
  }

  const resourceLoader = oneOfRule.oneOf.find(
    ({ type }) => type === "asset/resource"
  );

  if (!resourceLoader) {
    throwUnexpectedConfigError({
      packageName: "@semantic-ui-react/craco-less",
      message:
        "Can't find a 'asset/resource' loader under module.rules in the " +
        `${context.env} webpack config!`
    });
  }

  resourceLoader.exclude.push(/theme.config$/);
  resourceLoader.exclude.push(/\.variables$/);
  resourceLoader.exclude.push(/\.overrides$/);

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
