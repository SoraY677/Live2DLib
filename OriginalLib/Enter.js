/**
 * ライブ2Dの簡易実装クラス
 * 原則このクラスを介してLive2Dへの命令を行う
 */
import {
	Live2DCubismFramework as live2dcubismframework,
	Option as Csm_Option,
	LogLevel
} from "../Live2D/Framework/live2dcubismframework";

import {
	Model as LModel
} from './Model'

const CubismFramework = live2dcubismframework.CubismFramework;

export let canvas = null
export let gl = null
export let frameBuffer = null


export class Enter {

	/**
	 * コンストラクタ
	 * @param {Element} canvasDom 
	 */
	constructor(canvasDom) {
		canvas = canvasDom
		canvas.width = 2400;
		canvas.height = 1500;
		gl = canvas.getContext('webGL') || canvas.getContext('experimental-webgl')
		// 透過設定
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		frameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
		this._cubismOption = new Csm_Option()
		this.initialize().then(() => {
			// this.run()
		})
	}


	loadModel() {

	}

	/**
	 * 初期化処理一式
	 * @param {String} modelPath 
	 */
	async initialize(modelPath) {
		this._cubismOption.logFunction = this.printMessage;
		this._cubismOption.loggingLevel = LogLevel.LogLevel_Info;
		CubismFramework.startUp(this._cubismOption);
		CubismFramework.initialize();
		this._model = new LModel('../Model/Hiyori', "Hiyori.model3.json", "Hiyori.moc3")
		// this._renderer = new LRenderer()
		// await this._model.initialize("../../../resources/Live2D/Model", "Hiyori.model3.json", "Hiyori.moc3")
	}
}