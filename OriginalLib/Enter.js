/**
 * ライブ2Dの簡易実装クラス
 * 原則このクラスを介してLive2Dへの命令を行う
 */
export default class Enter {

	/**
	 * 初期化
	 * @param {*} canvasDom 
	 */
	constructor(canvasDom, modelPath) {
		canvas = canvasDom
		canvas.width = 2400;
		canvas.height = 1500;
		gl = canvas.getContext('webGL') || canvas.getContext('experimental-webgl')
		// 透過設定
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		frameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
		this._cubismOption = new Csm_Option()
		// this.initialize().then(() => {
		// 	this.run()
		// })
	}


	loadModel() {

	}

	async initialize(modelPath) {
		this._cubismOption.logFunction = this.printMessage;
		this._cubismOption.loggingLevel = LogLevel.LogLevel_Info;
		CubismFramework.startUp(this._cubismOption);
		CubismFramework.initialize();
		// this._model = new LModel()
		// this._renderer = new LRenderer()
		// await this._model.initialize("../../../resources/Live2D/Model", "Hiyori.model3.json", "Hiyori.moc3")
	}
}