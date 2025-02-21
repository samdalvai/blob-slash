import Component from '../ecs/Component';

export default class EntityDestinationComponent extends Component {
    destinationX: number;
    destinationY: number;

    constructor(destinationX = 0, destinationY = 0) {
        super();
        this.destinationX = destinationX;
        this.destinationY = destinationY;
    }
}
