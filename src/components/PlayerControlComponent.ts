import Component from '../ecs/Component';

export default class PlayerControlComponent extends Component {
    velocity: number;
    keysPressed: string[] = [];

    constructor(velocity = 0) {
        super();
        this.velocity = velocity;
    }
}
