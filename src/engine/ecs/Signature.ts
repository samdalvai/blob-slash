const MAX_COMPONENTS = 32;

export default class Signature {
    private _signature: number;

    constructor() {
        this._signature = 0;
    }

    get signature() {
        return this._signature;
    }

    set(bit: number) {
        if (bit < 0 || bit >= MAX_COMPONENTS) {
            throw new Error(`Signature index must be between 0 and ${MAX_COMPONENTS - 1}`);
        }
        this._signature |= 1 << bit;
    }

    remove(bit: number) {
        if (bit < 0 || bit >= MAX_COMPONENTS) {
            throw new Error(`Signature index must be between 0 and ${MAX_COMPONENTS - 1}`);
        }

        this._signature &= ~(1 << bit);
    }

    test(bit: number) {
        if (bit < 0 || bit >= MAX_COMPONENTS) {
            throw new Error(`Signature index must be between 0 and ${MAX_COMPONENTS - 1}`);
        }

        return (this._signature & (1 << bit)) !== 0;
    }

    reset() {
        this._signature = 0;
    }
}
