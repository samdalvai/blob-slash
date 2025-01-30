export type ComponentClass<T extends Component> = {
    new (...args: any[]): T;
    getComponentId(): number;
};

export class IComponent {
    static nextId = 0;

    static resetIds(): void {
        this.nextId = 0;
    }
}

export default class Component extends IComponent {
    private static _id?: number;

    static getComponentId() {
        if (this._id === undefined) {
            this._id = IComponent.nextId++;
        }
        return this._id;
    }
}
