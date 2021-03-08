/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

/**
 * プラットフォーム依存機能を抽象化する Cubism Platform Abstraction Layer.
 *
 * ファイル読み込みや時刻取得等のプラットフォームに依存する関数をまとめる。
 */

export const LCommon = {
	s_currentFrame: 0.0,
	s_lastFrame: 0.0,
	s_deltaTime: 0.0,
	loadFileAsBytes(filePath, callback) {
		fetch(filePath)
			.then(response => response.arrayBuffer())
			.then(arrayBuffer => callback(arrayBuffer, arrayBuffer.byteLength));
	},
	/**
	 * デルタ時間（前回フレームとの差分）を取得する
	 * @return デルタ時間[ms]
	 */
	getDeltaTime() {
		return this.s_deltaTime;
	},
	/**
	 * デルタ時間を更新する
	 */
	updateTime() {
		this.s_currentFrame = Date.now();
		this.s_deltaTime = (this.s_currentFrame - this.s_lastFrame) / 1000;
		this.s_lastFrame = this.s_currentFrame;
	},

	printMessage(message) {
		console.log(message);
	}
}