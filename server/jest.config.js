export const testEnvironment = 'node';
export const transform = {
    '^.+\\.ts?$': 'babel-jest',
};
export const setupFiles = ['<rootDir>/tests/setupEnv.ts'];