// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
    // All imported modules in your tests should be mocked automatically
    // automock: false,

    // Stop running tests after the first failure
    // bail: false,

    // Respect "browser" field in package.json when resolving modules
    // browser: false,

    // The directory where Jest should store its cached dependency information
    // cacheDirectory: "/tmp/jest_rt",

    // Automatically clear mock calls and instances between every test
    clearMocks: true,

    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: true,

    // An array of glob patterns indicating a set of files for which coverage information should be collected
    // collectCoverageFrom: null,

    // The directory where Jest should output its coverage files
    coverageDirectory: '<rootDir>/jest',

    // An array of regexp pattern strings used to skip coverage collection
    coveragePathIgnorePatterns: ['/node_modules/', 'd.ts', 'json'],

    // A list of reporter names that Jest uses when writing coverage reports
    coverageReporters: ['html'],

    // An object that configures minimum threshold enforcement for coverage results
    // coverageThreshold: null,

    // Make calling deprecated APIs throw helpful error messages
    // errorOnDeprecated: false,

    // Force coverage collection from ignored files usin a array of glob patterns
    // forceCoverageMatch: [],

    // A path to a module which exports an async function that is triggered once before all test suites
    // globalSetup: null,

    // A path to a module which exports an async function that is triggered once after all test suites
    // globalTeardown: null,

    // A set of global variables that need to be available in all test environments
    globals: {
        'ts-jest': {
            tsConfig: './tsconfig.json',
            isolatedModules: true,
            preserveSymlinks: true,
        },
    },

    // An array of directory names to be searched recursively up from the requiring module's location
    // moduleDirectories: [
    //   "node_modules"
    // ],

    // An array of file extensions your modules use
    moduleFileExtensions: ['ts', 'tsx', 'js'],

    // A map from regular expressions to module names that allow to stub out resources with a single module
    moduleNameMapper: {
        '^BobjollAccordion$': '<rootDir>/ts/partials/accordion-v1.0',
        '^BobjollAlert$': '<rootDir>/ts/partials/alert-v1.0',
        '^BobjollCopy$': '<rootDir>/ts/partials/copy-v1.0',
        '^BobjollDropdown$': '<rootDir>/ts/partials/dropdown-v1.0',
        '^BobjollExpandable$': '<rootDir>/ts/partials/expandable-v1.0',
        '^BobjollFeedback$': '<rootDir>/ts/partials/feedback-v1.0',
        '^BobjollModal$': '<rootDir>/ts/partials/modal-v1.0',
        '^BobjollNotifications$': '<rootDir>/ts/partials/notifications-v1.1',
        '^BobjollPassword$': '<rootDir>/ts/partials/password-v1.0',
        '^BobjollPopover$': '<rootDir>/ts/partials/popover-v1.0',
        '^BobjollScrollable$': '<rootDir>/ts/partials/scrollable-v1.0',
        '^BobjollTabs$': '<rootDir>/ts/partials/tabs-v1.0',
        '^BobjollTags$': '<rootDir>/ts/partials/tags-v1.0', 
        '^BobjollTemplate/(.*)$': '<rootDir>/ts/views/hbs/$1',
        '^BobjollTrigger$': '<rootDir>/ts/partials/trigger-v2.0',
        '^BobjollUpload$': '<rootDir>/ts/partials/upload-v1.0',
        '^BobjollView$': '<rootDir>/ts/partials/hbs-v1.0',
        '^Settings$': '<rootDir>/ts/library/settings',
        'bobjoll/(.*)': '<rootDir>/$1',
        'Project/(.*)': '<rootDir>/jest-mocks/$1',
    },

    // An array of regexp pattern strings, matched against all module paths before considered 'visible' to the module loader
    // modulePathIgnorePatterns: [],

    // Activates notifications for test results
    // notify: false,

    // An enum that specifies notification mode. Requires { notify: true }
    // notifyMode: "always",

    // A preset that is used as a base for Jest's configuration
    // preset: null,

    // Run tests from one or more projects
    // projects: null,

    // Use this configuration option to add custom reporters to Jest
    // reporters: undefined,

    // Automatically reset mock state between every test
    // resetMocks: false,

    // Reset the module registry before running each individual test
    // resetModules: false,

    // A path to a custom resolver
    // resolver: null,

    // Automatically restore mock state between every test
    // restoreMocks: false,

    // The root directory that Jest should scan for tests and modules within
    rootDir: '.',

    // A list of paths to directories that Jest should use to search for files in
    // roots: [
    //   "<rootDir>"
    // ],

    // Allows you to use a custom runner instead of Jest's default test runner
    // runner: "jest-runner",

    // The paths to modules that run some code to configure or set up the testing environment before each test
    setupFiles: ['<rootDir>/ts/jest-setup.js'],

    // The path to a module that runs some code to configure or set up the testing framework before each test
    // setupTestFrameworkScriptFile: null,

    // A list of paths to snapshot serializer modules Jest should use for snapshot testing
    // snapshotSerializers: [],

    // The test environment that will be used for testing
    testEnvironment: "jest-environment-jsdom",

    // Options that will be passed to the testEnvironment
    // testEnvironmentOptions: {},

    // Adds a location field to test results
    // testLocationInResults: false,

    // The glob patterns Jest uses to detect test files
    testMatch: ['**/*spec.+(ts|tsx|js)'],

    // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
    // testPathIgnorePatterns: [
    //   "/node_modules/"
    // ],

    // The regexp pattern Jest uses to detect test files
    // testRegex: "",

    // This option allows the use of a custom results processor
    // testResultsProcessor: null,

    // This option allows use of a custom test runner
    // testRunner: "jasmine2",

    // This option sets the URL for the jsdom environment. It is reflected in properties such as location.href
    // testURL: "http://localhost",

    // Setting this value to "fake" allows the use of fake timers for functions such as "setTimeout"
    // timers: "real",

    // A map from regular expressions to paths to transformers
    transform: {
        '\\.(ts|tsx)$': 'ts-jest',
        '\\.hbs$': 'jest-handlebars',
    },

    // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
    transformIgnorePatterns: [],

    // An array of regexp pattern strings that are matched against all modules before the module loader will automatically return a mock for them
    // unmockedModulePathPatterns: undefined,

    // Indicates whether each individual test should be reported during the run
    // verbose: null,

    // An array of regexp patterns that are matched against all source file paths before re-running tests in watch mode
    // watchPathIgnorePatterns: [],

    // Whether to use watchman for file crawling
    // watchman: true,
};
