import CooldownComponent from '../components/CooldownComponent';
import System from '../ecs/System';

export default class CooldownSystem extends System {
    constructor() {
        super();
        this.requireComponent(CooldownComponent);
    }

    update() {
        for (const entity of this.getSystemEntities()) {
            //
        }
    }
}
