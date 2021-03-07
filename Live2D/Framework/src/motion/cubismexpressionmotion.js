"use strict";
/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Live2DCubismFramework = void 0;
var acubismmotion_1 = require("./acubismmotion");
var cubismjson_1 = require("../utils/cubismjson");
var live2dcubismframework_1 = require("../live2dcubismframework");
var csmvector_1 = require("../type/csmvector");
var csmVector = csmvector_1.Live2DCubismFramework.csmVector;
var CubismFramework = live2dcubismframework_1.Live2DCubismFramework.CubismFramework;
var CubismJson = cubismjson_1.Live2DCubismFramework.CubismJson;
var ACubismMotion = acubismmotion_1.Live2DCubismFramework.ACubismMotion;
var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    // exp3.jsonのキーとデフォルト
    var ExpressionKeyFadeIn = 'FadeInTime';
    var ExpressionKeyFadeOut = 'FadeOutTime';
    var ExpressionKeyParameters = 'Parameters';
    var ExpressionKeyId = 'Id';
    var ExpressionKeyValue = 'Value';
    var ExpressionKeyBlend = 'Blend';
    var BlendValueAdd = 'Add';
    var BlendValueMultiply = 'Multiply';
    var BlendValueOverwrite = 'Overwrite';
    var DefaultFadeTime = 1.0;
    /**
     * 表情のモーション
     *
     * 表情のモーションクラス。
     */
    var CubismExpressionMotion = /** @class */ (function (_super) {
        __extends(CubismExpressionMotion, _super);
        /**
         * コンストラクタ
         */
        function CubismExpressionMotion() {
            var _this = _super.call(this) || this;
            _this._parameters = new csmVector();
            return _this;
        }
        /**
         * インスタンスを作成する。
         * @param buffer expファイルが読み込まれているバッファ
         * @param size バッファのサイズ
         * @return 作成されたインスタンス
         */
        CubismExpressionMotion.create = function (buffer, size) {
            var expression = new CubismExpressionMotion();
            var json = CubismJson.create(buffer, size);
            var root = json.getRoot();
            expression.setFadeInTime(root.getValueByString(ExpressionKeyFadeIn).toFloat(DefaultFadeTime)); // フェードイン
            expression.setFadeOutTime(root.getValueByString(ExpressionKeyFadeOut).toFloat(DefaultFadeTime)); // フェードアウト
            // 各パラメータについて
            var parameterCount = root
                .getValueByString(ExpressionKeyParameters)
                .getSize();
            expression._parameters.prepareCapacity(parameterCount);
            for (var i = 0; i < parameterCount; ++i) {
                var param = root
                    .getValueByString(ExpressionKeyParameters)
                    .getValueByIndex(i);
                var parameterId = CubismFramework.getIdManager().getId(param.getValueByString(ExpressionKeyId).getRawString()); // パラメータID
                var value = param
                    .getValueByString(ExpressionKeyValue)
                    .toFloat(); // 値
                // 計算方法の設定
                var blendType = void 0;
                if (param.getValueByString(ExpressionKeyBlend).isNull() ||
                    param.getValueByString(ExpressionKeyBlend).getString() ==
                        BlendValueAdd) {
                    blendType = ExpressionBlendType.ExpressionBlendType_Add;
                }
                else if (param.getValueByString(ExpressionKeyBlend).getString() ==
                    BlendValueMultiply) {
                    blendType = ExpressionBlendType.ExpressionBlendType_Multiply;
                }
                else if (param.getValueByString(ExpressionKeyBlend).getString() ==
                    BlendValueOverwrite) {
                    blendType = ExpressionBlendType.ExpressionBlendType_Overwrite;
                }
                else {
                    // その他 仕様にない値を設定した時は加算モードにすることで復旧
                    blendType = ExpressionBlendType.ExpressionBlendType_Add;
                }
                // 設定オブジェクトを作成してリストに追加する
                var item = new ExpressionParameter();
                item.parameterId = parameterId;
                item.blendType = blendType;
                item.value = value;
                expression._parameters.pushBack(item);
            }
            CubismJson.delete(json); // JSONデータは不要になったら削除する
            return expression;
        };
        /**
         * モデルのパラメータの更新の実行
         * @param model 対象のモデル
         * @param userTimeSeconds デルタ時間の積算値[秒]
         * @param weight モーションの重み
         * @param motionQueueEntry CubismMotionQueueManagerで管理されているモーション
         */
        CubismExpressionMotion.prototype.doUpdateParameters = function (model, userTimeSeconds, weight, motionQueueEntry) {
            for (var i = 0; i < this._parameters.getSize(); ++i) {
                var parameter = this._parameters.at(i);
                switch (parameter.blendType) {
                    case ExpressionBlendType.ExpressionBlendType_Add: {
                        model.addParameterValueById(parameter.parameterId, parameter.value, weight);
                        break;
                    }
                    case ExpressionBlendType.ExpressionBlendType_Multiply: {
                        model.multiplyParameterValueById(parameter.parameterId, parameter.value, weight);
                        break;
                    }
                    case ExpressionBlendType.ExpressionBlendType_Overwrite: {
                        model.setParameterValueById(parameter.parameterId, parameter.value, weight);
                        break;
                    }
                    default:
                        // 仕様にない値を設定した時はすでに加算モードになっている
                        break;
                }
            }
        };
        return CubismExpressionMotion;
    }(ACubismMotion));
    Live2DCubismFramework.CubismExpressionMotion = CubismExpressionMotion;
    /**
     * 表情パラメータ値の計算方式
     */
    var ExpressionBlendType;
    (function (ExpressionBlendType) {
        ExpressionBlendType[ExpressionBlendType["ExpressionBlendType_Add"] = 0] = "ExpressionBlendType_Add";
        ExpressionBlendType[ExpressionBlendType["ExpressionBlendType_Multiply"] = 1] = "ExpressionBlendType_Multiply";
        ExpressionBlendType[ExpressionBlendType["ExpressionBlendType_Overwrite"] = 2] = "ExpressionBlendType_Overwrite"; // 上書き
    })(ExpressionBlendType = Live2DCubismFramework.ExpressionBlendType || (Live2DCubismFramework.ExpressionBlendType = {}));
    /**
     * 表情のパラメータ情報
     */
    var ExpressionParameter = /** @class */ (function () {
        function ExpressionParameter() {
        }
        return ExpressionParameter;
    }());
    Live2DCubismFramework.ExpressionParameter = ExpressionParameter;
})(Live2DCubismFramework = exports.Live2DCubismFramework || (exports.Live2DCubismFramework = {}));
//# sourceMappingURL=cubismexpressionmotion.js.map