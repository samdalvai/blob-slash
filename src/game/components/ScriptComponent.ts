import Component from '../../engine/ecs/Component';
import { Vector } from '../../engine/types/utils';

type ScriptAction = { movement: Vector; duration: number };

export default class ScriptComponent extends Component {
    scripts: ScriptAction[];
    currentActionIndex: number;
    actionStart: number;

    constructor(scripts = []) {
        super();
        this.scripts = scripts;
        this.currentActionIndex = 0;
        this.actionStart = performance.now();
    }
}
