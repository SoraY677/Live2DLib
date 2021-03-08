/**
 * 共通変数・関数の管理モジュール
 */
export const Common = {
	s_currentFrame: 0.0,
	s_lastFrame: 0.0,
	s_deltaTime: 0.0,
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

	/**
	 * オブジェクトにキー配列がすべて含まれるか判定
	 * @param {Object} obj 
	 * @param {Object} list 
	 */
	judgeAllKeyContained(obj, list) {

		if (typeof obj != 'object') {
			throw 'arg "obj" not object'
		}
		if (typeof list != 'object' || list.length == 0) {
			throw `arg ${list} not list object`
		}
		const _obj = obj
		const _list = list
		for (const i in _list) {
			if (!(_list[i] in _obj)) throw `not found ${_list[i]} in ${_obj}`
		}

	}
}