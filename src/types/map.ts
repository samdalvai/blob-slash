import { ComponentType } from './components';

export type LevelMap = {
    tiles: number[][];
    entities: EntityMap[];
};

export type EntityMap = {
    tag?: string;
    group?: string;
    components: ComponentType[];
};
