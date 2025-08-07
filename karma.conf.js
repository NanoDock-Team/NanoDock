module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-jasmine-html-reporter"),
      require("karma-coverage"),
      require("@angular-devkit/build-angular/plugins/karma"),
    ],
    client: {
      jasmine: {
        // Opciones de configuración de Jasmine
      },
      clearContext: false, // Deja visible la salida del runner en el navegador
    },
    jasmineHtmlReporter: {
      suppressAll: true, // Suprime trazas duplicadas
    },
    coverageReporter: {
      // Ubicación y tipos de reportes según la documentación oficial.
      dir: require("path").join(__dirname, "./coverage"),
      subdir: ".",
      reporters: [
        { type: "html" },
        { type: "lcovonly", file: "lcov.info" },
        { type: "text-summary" },
      ],
      fixWebpackSourcePaths: true,
      //includeAllSources: true,
      skipFilesWithNoCoverage: true,
      // Umbrales mínimos de cobertura (ajusta según convenga)
      check: {
        global: {
          statements: 50,
          branches: 50,
          functions: 50,
          lines: 50,
        },
      },
    },
    reporters: ["progress", "kjhtml"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Chrome"],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox"],
      },
    },
    singleRun: false,
    restartOnFileChange: true,
  });
};
