import Component from './Component';

export class IPool {}

export default class Pool<T extends Component> extends IPool {
    private _data: T[];
    private _size: number;
    private _entityIdToIndex: (number | undefined)[];
    private _indexToEntityId: (number | undefined)[];

    constructor() {
        super();
        this._data = [];
        this._size = 0;
        this._entityIdToIndex = [];
        this._indexToEntityId = [];
    }

    get data(): readonly T[] {
        return this._data;
    }

    get size() {
        return this._size;
    }

    get entityIdToIndex(): ReadonlyArray<number | undefined> {
        return this._entityIdToIndex;
    }

    get indexToEntityId(): ReadonlyArray<number | undefined> {
        return this._indexToEntityId;
    }

    isEmpty() {
        return this._size == 0;
    }

    getSize() {
        return this._size;
    }

    getByIndex(index: number): T | undefined {
        return this._data[index];
    }

    getEntityIndex(entityId: number) {
        return this._entityIdToIndex[entityId];
    }

    getEntityIdAtIndex(index: number) {
        return this._indexToEntityId[index];
    }

    clear() {
        this._data = [];
        this._size = 0;
        this._entityIdToIndex.length = 0;
        this._indexToEntityId.length = 0;
    }

    set(entityId: number, component: T) {
        const index = this._entityIdToIndex[entityId];

        if (index !== undefined) {
            // If the element already exists, simply replace the component object
            this._data[index] = component;
        } else {
            const index = this._size;
            this._entityIdToIndex[entityId] = index;
            this._indexToEntityId[index] = entityId;
            this._data[index] = component;
            this._size++;
        }
    }

    remove(entityId: number) {
        // Copy the last element to the deleted position to keep the array packed
        const indexOfRemoved = this._entityIdToIndex[entityId];

        if (indexOfRemoved === undefined) {
            console.warn('Could not find entity with id ' + entityId + ' in component pool');
            return;
        }

        const indexOfLast = this._size - 1;
        const entityIdOfLastElement = this._indexToEntityId[indexOfLast];

        if (entityIdOfLastElement === undefined) {
            console.warn('Could not find last index of entity in component pool');
            return;
        }

        this._data[indexOfRemoved] = this._data[indexOfLast];
        this._data.pop();

        // Update the index-entity arrays to point to the correct elements
        this._entityIdToIndex[entityIdOfLastElement] = indexOfRemoved;
        this._indexToEntityId[indexOfRemoved] = entityIdOfLastElement;

        this._entityIdToIndex[entityId] = undefined;
        this._indexToEntityId.pop();

        this._size--;
    }

    removeEntityFromPool(entityId: number) {
        if (this._entityIdToIndex[entityId] !== undefined) {
            this.remove(entityId);
        }
    }

    get(entityId: number): T | undefined {
        const componentIndex = this._entityIdToIndex[entityId];

        if (componentIndex === undefined) {
            console.warn('Could not find entity with id ' + entityId + ' in component pool');
            return undefined;
        }

        return this._data[componentIndex];
    }
}
