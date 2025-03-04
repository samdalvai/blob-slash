import Component from '../ecs/Component';

export default class GuiComponent extends Component {
    velocity: number;

    constructor(velocity = 0) {
        super();
        this.velocity = velocity;
    }
}
