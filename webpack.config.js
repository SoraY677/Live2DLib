// output.pathに絶対パスを指定する必要があるため、pathモジュールを読み込んでおく
const path = require('path');

module.exports = {
	// モードの設定、v4系以降はmodeを指定しないと、webpack実行時に警告が出る
	mode: 'development',
	// エントリーポイントの設定
	entry: './script.js',
	// 出力の設定
	output: {
		// 出力するファイル名
		filename: 'bundle.js',
		// 出力先のパス（絶対パスを指定する必要がある）
		path: path.join(__dirname, 'dist')
	},
	module: {
		rules: [{
			test: /\.css/,
			use: [
				"style-loader",
				{
					loader: "css-loader",
					options: {
						url: false
					}
				}
			]
		}]
	}
};