import Component from '../../core/ecs/Component';

export default class LightEmitComponent extends Component {
    lightRadius: number;

    constructor(lightRadius = 0) {
        super();
        this.lightRadius = lightRadius;
    }
}
