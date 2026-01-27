module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: [
		'eslint:recommended',
		// 'plugin:@typescript-eslint/recommended',  // todo: https://stackoverflow.com/questions/57597142/how-to-run-typescript-eslint-on-ts-files-and-eslint-on-js-files-in-the-same-pr
		'plugin:svelte/recommended',
		'prettier'
	],
	plugins: ['@typescript-eslint'],
	ignorePatterns: ['*.cjs'],
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2019
	},
	rules: {
		'no-unused-expressions': 'warn',
		'no-constant-binary-expression': 'warn',
		'no-sequences': 'warn'
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
};
