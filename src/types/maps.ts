import { ComponentType } from './components';

export type TileMap = {
    tiles: number[][];
};

export type LevelMap = {
    tileMap: TileMap;
    entities: EntityMap[];
};

export type EntityMap = {
    components: ComponentType[];
};
