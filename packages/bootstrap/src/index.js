const chalk = require("chalk");
const fs = require("fs");
const logSymbols = require("log-symbols");
const ncp = require("ncp");
const path = require("path");

const SPACE = "  ";

const hasMissingPackages = packageNames => {
  return !packageNames.every(packageName => {
    if (
      fs.existsSync(path.resolve(process.cwd(), "node_modules", packageName))
    ) {
      return true;
    }

    console.log(
      logSymbols.error,
      chalk.bgRed.bold(`"${packageName}" was not found in your "node_modules".`)
    );
    console.log(`${SPACE}Please install it by Yarn or NPM:`);
    console.log(`${SPACE}- yarn add --dev ${packageName}`);
    console.log(`${SPACE}- npm install ${packageName} --save-dev`);

    return false;
  });
};

const copyDirectoryRecursive = (src, dest) =>
  new Promise((resolve, reject) => {
    ncp(src, dest, function(err) {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });

const run = async () => {
  if (
    hasMissingPackages([
      "@craco/craco",
      "@semantic-ui-react/craco-less",
      "semantic-ui-less",
      "semantic-ui-react"
    ])
  ) {
    return;
  } else {
    console.log(logSymbols.info, `All required packages are installed.`);
  }

  if (!fs.existsSync(path.resolve("craco.config.js"))) {
    console.log(
      logSymbols.error,
      chalk.bgRed.bold('"craco.config.js" does not exist.')
    );
    console.log(`${SPACE}Please check that you have created it.`);

    return;
  }

  if (fs.existsSync(path.resolve("src", "semantic-ui"))) {
    console.log(
      logSymbols.error,
      chalk.bgRed.bold('"src/semantic-ui" directory has been already created.')
    );
    console.log(
      `${SPACE}Please remove "src/semantic-ui" directory to use this tool.`
    );

    return;
  } else {
    fs.mkdirSync(path.resolve("src", "semantic-ui"));
    console.log(logSymbols.info, `"src/semantic-ui" directory is created.`);
  }

  await copyDirectoryRecursive(
    path.resolve(process.cwd(), "node_modules", "semantic-ui-less", "_site"),
    path.resolve("src", "semantic-ui", "site")
  );
  console.log(logSymbols.info, 'Files to "src/semantic-ui/site" were copied.');

  fs.copyFileSync(
    path.resolve(
      process.cwd(),
      "node_modules",
      "semantic-ui-less",
      "theme.config.example"
    ),
    path.resolve("src", "semantic-ui", "theme.config")
  );
  console.log(
    logSymbols.info,
    'Initial theme config was copied to "src/semantic-ui/theme.config".'
  );

  console.log(
    logSymbols.success,
    chalk.bgGreen.bold("Theme scaffolding was done successfully.")
  );
};

module.exports = {
  run
};
