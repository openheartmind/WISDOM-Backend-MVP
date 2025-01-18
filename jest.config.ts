export default {
   verbose:true,
   moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    moduleDirectories: ['node_modules', '<rootDir>/../'],
    // moduleNameMapper: {
    //   '^src/(.*)$': '<rootDir>/$1'
    // },
    moduleNameMapper: {
      "^(\\.{1,2}/.*)\\.ts$": "$1",
    },
    extensionsToTreatAsEsm: ['.ts'],
    transform: {
      '^.+\\.(t|j)s$': ['ts-jest', {
        useESM:true
    }],
      
    },
    // setupFilesAfterEnv: ['<rootDir>/../test/jest.setup.ts']
  };


// import type {Config} from 'jest';

// const config: Config = {
//   moduleFileExtensions: ['js', 'json', 'ts'], 
//   verbose: true,
//   testEnvironment: 'node',
//   collectCoverageFrom: ['**/*.(t|j)s']
// };

// export default config;