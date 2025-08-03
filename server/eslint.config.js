import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginJest from 'eslint-plugin-jest';

export default [
    {
        ignores: ['node_modules/', 'dist/', '.vscode/'],
    },

    js.configs.recommended,

    {
        files: ['**/*.{ts,tsx}'],
        plugins: {
            '@typescript-eslint': tseslint.plugin,
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.json',
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                ...globals.node,
            },
        },
        rules: {
            ...tseslint.configs['recommended'].rules,
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
            'no-unused-vars': 'off',
        },
    },

    {
        files: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*.ts'],
        ...pluginJest.configs['flat/recommended'],
        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
        rules: {
            // You can add or override Jest-specific rules here if you want
        },
    },
    eslintConfigPrettier,
];