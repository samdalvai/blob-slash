import Component from '../ecs/Component';

export default class EntityControlComponent extends Component {
    velocity: number;

    constructor(velocity = 0) {
        super();
        this.velocity = velocity;
    }
}
