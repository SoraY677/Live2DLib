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
	Common
} from './Common'

import {
	LModel
} from './LModel'

import {
	LRenderer
} from "./LRenderer"
const CubismFramework = live2dcubismframework.CubismFramework;

export let canvas = null
export let gl = null
export let frameBuffer = null


/**
 * Live2Dを操作するための管理クラス
 * これをインスタンス化してモデルのすべてを操作
 */
export class Manager {

	/**
	 * コンストラクタ
	 * @param {Element} canvasDom canvasのDOMElement
	 */
	constructor(canvasDom, modelSetting) {
		canvas = canvasDom
		canvas.width = document.body.clientWidth;
		canvas.height = document.body.clientHeight;
		gl = canvas.getContext('webGL') || canvas.getContext('experimental-webgl')
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		frameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
		this._cubismOption = new Csm_Option()

		Common.judgeAllKeyContained(modelSetting, ['modelRootDir', 'modelJson', 'modelMoc'])

		// 初期化処理
		this.initialize(modelSetting).then(() => {
			this.run()
		})
	}

	/**
	 * 初期化処理一式
	 * @param {Object} modelSetting 
	 */
	async initialize(modelSetting) {
		this._cubismOption.logFunction = this.printMessage;
		this._cubismOption.loggingLevel = LogLevel.LogLevel_Info;
		CubismFramework.startUp(this._cubismOption);
		CubismFramework.initialize();
		this._model = new LModel()
		this._renderer = new LRenderer()

		// セッティングJSONをもとにモデルの準備
		const ms = modelSetting
		await this._model.initialize(ms.modelRootDir, ms.modelJson, ms.modelMoc)
	}

	/**
	 * モデルの動作を開始
	 */
	run() {
		// メインループ
		const loop = () => {
			// 時間更新
			Common.updateTime();

			// グラフィックの設定一覧
			gl.clearColor(1.0, 1.0, 1.0, 1.0); // 画面の初期化
			gl.enable(gl.DEPTH_TEST); // 深度テストを有効化
			gl.depthFunc(gl.LEQUAL); // 近くにある物体は、遠くにある物体を覆い隠す
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // カラーバッファや深度バッファをクリアする
			gl.clearDepth(1.0);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

			// 描画更新
			this._model.update()

			// ループのために再帰呼び出し
			requestAnimationFrame(loop);
		};
		loop();
	}
}