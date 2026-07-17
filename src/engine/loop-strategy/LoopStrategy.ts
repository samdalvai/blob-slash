import Engine from '../Engine';

export default class LoopStrategy {
    protected engine: Engine<any>;

    constructor(engine: Engine<any>) {
        this.engine = engine;
    }

    async start() {
        throw new Error('No start method defined for loop strategy: ' + this.constructor.name);
    }
}
