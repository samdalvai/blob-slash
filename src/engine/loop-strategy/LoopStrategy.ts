import Engine from '../Engine';

export default class LoopStrategy {
    protected engine: Engine;

    constructor(engine: Engine) {
        this.engine = engine;
    }

    async start() {
        throw new Error('No start method defined for loop strategy: ' + this.constructor.name);
    }
}
