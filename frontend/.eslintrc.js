module.exports = {
	root: true,
	env: {
		node: true
	},
	'extends': [
		'plugin:vue/essential',
		'eslint:recommended'
	],
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'indent': [
			'warn', 'tab', {
				'SwitchCase': 1,
				'MemberExpression': 'off',
				'FunctionDeclaration': {'body':1, 'parameters':'off'},
				'FunctionExpression': {'body':1, 'parameters':'off'},
				'CallExpression': {'arguments':'off'},
				'ArrayExpression': 1,
				'ObjectExpression': 1,
				'ignoredNodes': ['ConditionalExpression']
			}
		],
	},
	parserOptions: {
		parser: 'babel-eslint'
	}
}