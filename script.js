import "./style.css";

import {
	Manager
} from './OriginalLib/Manager'

const canvas = document.getElementById('model_canvas')
const modelSetting = {
	'modelRootDir': '../Model/Hiyori/',
	'modelJson': 'Hiyori.model3.json',
	'modelMoc': 'Hiyori.moc3'
}

const enter = new Manager(canvas, modelSetting)