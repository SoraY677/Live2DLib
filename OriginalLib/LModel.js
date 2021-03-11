import {
	Live2DCubismFramework as cubismusermodel
} from '../Live2D/Framework/model/cubismusermodel';
import {
	Live2DCubismFramework as cubismmodelsettingjson
} from '../Live2D/Framework/cubismmodelsettingjson';
import {
	Live2DCubismFramework as cubismmotion
} from '../Live2D/Framework/motion/cubismmotion';
import {
	Live2DCubismFramework as cubismmodelmatrix
} from "../Live2D/Framework/math/cubismmodelmatrix"
import {
	Live2DCubismFramework as cubismmatrix44
} from "../Live2D/Framework/math/cubismmatrix44"

const CubismUserModel = cubismusermodel.CubismUserModel;
const CubismModelSettingJson = cubismmodelsettingjson.CubismModelSettingJson;
const CubismMotion = cubismmotion.CubismMotion;
const CubismModelMatrix = cubismmodelmatrix.CubismModelMatrix
const CubismMatrix44 = cubismmatrix44.CubismMatrix44

import {
	gl,
	frameBuffer,
	canvas
} from "./Manager"

import {
	renderer
} from "./LRenderer"

import {
	LModelAction
} from "./LModelAction"


export class LModel extends CubismUserModel {

	/**
	 * 初期化
	 * @param {String} dirpath 
	 * @param {String} jsonFN jsonファイル名
	 * @param {String} mocFN mocファイル名
	 */
	initialize(dirpath, jsonFN, mocFN) {
		this._modelAction = new LModelAction()

		this._dirpath = dirpath
		return new Promise(async (resolve, reject) => {
			try {
				await (this.loadAssets(jsonFN)) // jsonの読み込み
				this.createRenderer();
				await this.setupTextures()
				this.getRenderer().startUp(gl);

				this.draw()

				resolve(true)
			} catch (e) {
				console.error(e)
				reject(e)
			}
		})
	}

	/**
	 * Frameworkを使った.model3.jsonファイルからの読み込み
	 * @param {String} filepath
	 */
	loadAssets(filename) {
		return new Promise((resolve, reject) => {
			fetch(`${this._dirpath}/${filename}`)
				.then(
					(response) => {
						return response.arrayBuffer();
					})
				.then(
					async (arrayBuffer) => {
						let buffer = arrayBuffer;
						let size = buffer.byteLength;
						this._modelSetting = new CubismModelSettingJson(buffer, size);
						await this.loadMotionFile()
						await this.setupModel()
						resolve(true)

					})
				.catch(
					(e) => {
						console.error(e)
						reject(false)
					}
				)
		})
	}

	/**
	 * モーションファイルを読み込み
	 * @returns {Promise} 読み込み成功/失敗 => true/false
	 */
	loadMotionFile() {
		return new Promise((resolve, reject) => {
			const groupCount = this._modelSetting.getMotionGroupCount()

			for (let i = 0; i < groupCount; i++) {
				const group = this._modelSetting.getMotionGroupName(i);

				/* groupIDからmotionファイル名を取得 */
				const motionCount = this._modelSetting.getMotionCount(group)
				for (let j = 0; j < motionCount; j++) {
					const motionFileName = this._modelSetting.getMotionFileName(group, j);
					fetch(`${this._dirpath}/${motionFileName}`)
						.then((response) => response.arrayBuffer())
						.then((arrayBuffer) => {
							let buffer = arrayBuffer;
							let size = buffer.byteLength;
							this._modelAction._motionList.push(CubismMotion.create(buffer, size))
							resolve(true)
						})
						.catch(() => reject(false))
				}
			}
		})
	}

	/**
	 * 読み込んだmodel3.jsonからモデル読み込みを実行
	 * @returns {Promise} 読み込み成功/失敗 => true/false
	 */
	setupModel() {
		return new Promise((resolve, reject) => {
			// CubismModel
			if (this._modelSetting.getModelFileName() != '') {

				const modelFileName = this._modelSetting.getModelFileName();

				fetch(`${this._dirpath}/${modelFileName}`)
					.then((response) => {
						return response.arrayBuffer()
					})
					.then((arrayBuffer) => {
						this.loadModel(arrayBuffer);
						this._modelAction.setting(this, this._dirpath)
						resolve(true)
					})
					.catch((e) => reject(e))
			}
		})

	}



	/**
	 * テクスチャの用意
	 * @returns {Promise} 
	 */
	setupTextures() {
		return new Promise((resolve, reject) => {
			try {
				//モデルとレンダラーの連携
				// renderer.initialize(this._model)
				// iPhoneでのアルファ品質向上のためTypescriptではpremultipliedAlphaを採用
				const usePremultiply = true;

				const textureCount = this._modelSetting.getTextureCount();
				const img = new Array(textureCount)


				for (let modelTextureNumber = 0; modelTextureNumber < textureCount; modelTextureNumber++) {
					// WebGLのテクスチャユニットにテクスチャをロードする
					let texturePath = this._modelSetting.getTextureFileName(modelTextureNumber);
					texturePath = this._dirpath + "/" + texturePath;

					img[modelTextureNumber] = new Image();
					img[modelTextureNumber].onload = () => {
						// テクスチャオブジェクトの作成
						const tex = gl.createTexture();

						// テクスチャを選択
						gl.bindTexture(gl.TEXTURE_2D, tex);

						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

						// Premult処理を行わせる 
						if (usePremultiply) {
							gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
						}

						// テクスチャにピクセルを書き込む
						gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
							gl.UNSIGNED_BYTE, img[modelTextureNumber]);

						// ミップマップを生成
						gl.generateMipmap(gl.TEXTURE_2D);

						this.getRenderer().bindTexture(modelTextureNumber, tex);

						//全ての読み込み完了時
						if (modelTextureNumber >= textureCount - 1) {
							resolve(true)
						}
					}

					img[modelTextureNumber].src = texturePath;
					this.getRenderer().setIsPremultipliedAlpha(usePremultiply);

				}
			} catch (e) {
				console.error(e)
				reject(false)
			}
		})
	}

	/**
	 * 描画処理
	 */
	draw() {
		const modelMatrix =
			new CubismModelMatrix(
				this._model.getCanvasWidth(),
				this._model.getCanvasHeight());

		const projectionMatrix = new CubismMatrix44();
		projectionMatrix.scale(1, 1);
		projectionMatrix.translateRelative(0, -1.3)
		projectionMatrix.scaleRelative(3, 3);
		projectionMatrix.multiplyByMatrix(modelMatrix);

		// キャンバスサイズを渡す
		const viewportSize = canvas.width < canvas.height ? canvas.width : canvas.height
		const viewport = [0, 0, viewportSize, viewportSize] //canvas.width, canvas.height];
		this.getRenderer().setRenderState(frameBuffer, viewport);
		this.getRenderer().setMvpMatrix(projectionMatrix);
		this.getRenderer().drawModel();
	}

	/**
	 * 更新処理
	 */
	update() {
		this._modelAction.update(this)
		this._model.update()
		this.draw()
	}

	fireLipSync(text) {
		this._modelAction.fireLipSync(this._model, text)
	}
}