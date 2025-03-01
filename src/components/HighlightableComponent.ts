import Component from '../ecs/Component';

export default class HighlightableComponent extends Component {
    assetId: string;
    isHighlighted: boolean;

    constructor(assetId = '', isHighlighted = false) {
        super();
        this.assetId = assetId;
        this.isHighlighted = isHighlighted;
    }
}
