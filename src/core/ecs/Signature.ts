const MAX_COMPONENTS = 32;

export default class Signature {
    signature: number;

    constructor() {
        this.signature = 0;
    }

    set(bit: number) {
        if (bit < 0 || bit >= MAX_COMPONENTS) {
            throw new Error(`Signature index must be between 0 and ${MAX_COMPONENTS - 1}`);
        }
        this.signature |= 1 << bit;
    }

    remove(bit: number) {
        if (bit < 0 || bit >= MAX_COMPONENTS) {
            throw new Error(`Signature index must be between 0 and ${MAX_COMPONENTS - 1}`);
        }

        this.signature &= ~(1 << bit);
    }

    test(bit: number) {
        if (bit < 0 || bit >= MAX_COMPONENTS) {
            throw new Error(`Signature index must be between 0 and ${MAX_COMPONENTS - 1}`);
        }

        return (this.signature & (1 << bit)) !== 0;
    }

    reset() {
        this.signature = 0;
    }
}
