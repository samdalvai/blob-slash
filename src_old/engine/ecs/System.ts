import { ComponentClass } from './Component';
import Entity from './Entity';
import Signature from './Signature';

export type SystemClass<T extends System> = {
    new (...args: any[]): T;
    getSystemId(): number;
};

export class ISystem {
    static nextId = 0;

    static resetIds(): void {
        this.nextId = 0;
    }
}

export default class System extends ISystem {
    private static _id?: number;
    private componentSignature: Signature;
    private entities: Entity[];
    private entityIdToIndex: Map<number, number>;

    constructor() {
        super();
        this.componentSignature = new Signature();
        this.entities = [];
        this.entityIdToIndex = new Map();
    }

    static getSystemId() {
        if (this._id === undefined) {
            this._id = ISystem.nextId++;
        }
        return this._id;
    }

    addEntityToSystem = (entity: Entity) => {
        const entityId = entity.getId();

        if (this.entityIdToIndex.has(entityId)) {
            return;
        }

        this.entityIdToIndex.set(entityId, this.entities.length);
        this.entities.push(entity);
    };

    removeEntityFromSystem = (entity: Entity) => {
        const entityId = entity.getId();
        const entityIndex = this.entityIdToIndex.get(entityId);

        if (entityIndex === undefined) {
            return;
        }

        const lastEntityIndex = this.entities.length - 1;
        const lastEntity = this.entities[lastEntityIndex];

        this.entities[entityIndex] = lastEntity;
        this.entities.pop();
        this.entityIdToIndex.delete(entityId);

        if (entityIndex !== lastEntityIndex) {
            this.entityIdToIndex.set(lastEntity.getId(), entityIndex);
        }
    };

    hasEntity = (entity: Entity) => {
        return this.entityIdToIndex.has(entity.getId());
    };

    getSystemEntities = () => {
        return this.entities;
    };

    getComponentSignature = () => {
        return this.componentSignature;
    };

    requireComponent = <T extends ComponentClass>(ComponentClass: T) => {
        const componentId = ComponentClass.getComponentId();
        this.componentSignature.set(componentId);
    };

    removeAllEntities = () => {
        this.entities = [];
        this.entityIdToIndex.clear();
    };
}
