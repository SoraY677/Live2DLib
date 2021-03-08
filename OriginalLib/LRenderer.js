import {
	Live2DCubismFramework as cubismrenderer_webgl
} from "../Live2D/Framework/rendering/cubismrenderer_webgl"
const CubismRenderer_WebGL = cubismrenderer_webgl.CubismRenderer_WebGL

// レンダラー
export let renderer = null

/**
 * レンダリングを担当するクラス
 */
export class LRenderer {
	constructor() {
		renderer = new CubismRenderer_WebGL();
	}
}