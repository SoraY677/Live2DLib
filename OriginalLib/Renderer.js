/**
 * レンダリングを担当するクラス
 */

import {
	Live2DCubismFramework as cubismrenderer_webgl
} from "../Live2D/Framework/rendering/cubismrenderer_webgl"
const CubismRenderer_WebGL = cubismrenderer_webgl.CubismRenderer_WebGL

export let renderer = null
export class LRenderer {
	constructor() {
		renderer = new CubismRenderer_WebGL();
	}


}