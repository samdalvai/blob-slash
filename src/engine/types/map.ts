import * as GameComponents from '../../game/components';

export type LevelMap = {
    textures: Asset[];
    sounds: Asset[];
    mapWidth: number;
    mapHeight: number;
    entities: EntityMap[];
};

export type Asset = {
    assetId: string;
    filePath: string;
};

export type EntityMap = {
    tag?: string;
    group?: string;
    components: ComponentMap[];
};

export type ComponentMap = {
    name: keyof typeof GameComponents;
    properties: {
        [key: string]: any;
    };
};
