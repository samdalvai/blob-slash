import Component from './Component';

export class IPool {}

export default class Pool<T extends Component> extends IPool {
    data: T[];
    size: number;
    entityIdToIndex: (number | undefined)[];
    indexToEntityId: (number | undefined)[];

    constructor() {
        super();
        this.data = [];
        this.size = 0;
        this.entityIdToIndex = [];
        this.indexToEntityId = [];
    }

    isEmpty() {
        return this.size == 0;
    }

    getSize() {
        return this.size;
    }

    clear() {
        this.data = [];
        this.size = 0;
        this.entityIdToIndex.length = 0;
        this.indexToEntityId.length = 0;
    }

    set(entityId: number, component: T) {
        const index = this.entityIdToIndex[entityId];

        if (index !== undefined) {
            // If the element already exists, simply replace the component object
            this.data[index] = component;
        } else {
            const index = this.size;
            this.entityIdToIndex[entityId] = index;
            this.indexToEntityId[index] = entityId;
            this.data[index] = component;
            this.size++;
        }
    }

    remove(entityId: number) {
        // Copy the last element to the deleted position to keep the array packed
        const indexOfRemoved = this.entityIdToIndex[entityId];

        if (indexOfRemoved === undefined) {
            console.warn('Could not find entity with id ' + entityId + ' in component pool');
            return;
        }

        const indexOfLast = this.size - 1;
        const entityIdOfLastElement = this.indexToEntityId[indexOfLast];

        if (entityIdOfLastElement === undefined) {
            console.warn('Could not find last index of entity in component pool');
            return;
        }

        this.data[indexOfRemoved] = this.data[indexOfLast];
        this.data.pop();

        // Update the index-entity arrays to point to the correct elements
        this.entityIdToIndex[entityIdOfLastElement] = indexOfRemoved;
        this.indexToEntityId[indexOfRemoved] = entityIdOfLastElement;

        this.entityIdToIndex[entityId] = undefined;
        this.indexToEntityId.pop();

        this.size--;
    }

    removeEntityFromPool(entityId: number) {
        if (this.entityIdToIndex[entityId] !== undefined) {
            this.remove(entityId);
        }
    }

    get(entityId: number): T | undefined {
        const componentIndex = this.entityIdToIndex[entityId];

        if (componentIndex === undefined) {
            console.warn('Could not find entity with id ' + entityId + ' in component pool');
            return undefined;
        }

        return this.data[componentIndex];
    }
}
