import Component from '../ecs/Component';

export default class ParticleEmitComponent extends Component {
    dimension: number;
    duration: number;
    emitFrequency: number;

    constructor(dimension = 1, duration = 1000, emitFrequency = 1000) {
        super();
        this.dimension = dimension;
        this.duration = duration;
        this.emitFrequency = emitFrequency;
    }
}
