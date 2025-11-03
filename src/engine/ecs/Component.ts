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

    /**
     * This property should be **overridden** by child classes when enums
     * need to be serialized. Examples:
     *
     * Example 1: Using a TypeScript enum
     *
     * enum MyValuesEnum {
     *   VALUE1 = 'value1',
     *   VALUE2 = 'value2',
     * }
     *
     * export default class MyComponent extends Component {
     *   static override _enums = {
     *     myProperty: MyValuesEnum,
     *   };
     *
     *   myProperty: MyValuesEnum;
     *
     *   // ...other component declarations
     * }
     *
     * In the editor, this will serialize the component with a selector
     * and two possible values: "value1" and "value2".
     *
     * Example 2: Using a string array instead of an enum
     *
     * static override _enums = {
     *   myProperty: ['value1', 'value2'],
     * };
     */
    protected static _enums = {};

    static getComponentId() {
        if (this._id === undefined) {
            this._id = IComponent.nextId++;
        }
        return this._id;
    }
}
