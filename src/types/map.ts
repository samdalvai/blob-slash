import { ComponentType } from './components';

export type LevelMap = {
    tiles?: number[][];
    entities: EntityMap[];
};

export type EntityMap = {
    tag?: string;
    group?: string;
    components: ComponentMap[];
};

export type ComponentMap = {
    name: ComponentType;
    properties: {
        [key: string]: any;
    };
};
