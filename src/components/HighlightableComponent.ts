import Component from '../ecs/Component';

export default class HighlightableComponent extends Component {
    isHighlighted: boolean;

    constructor(isHighlighted = false) {
        super();
        this.isHighlighted = isHighlighted;
    }
}
