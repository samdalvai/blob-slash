export type LevelMap = {
    mapWidth: number;
    mapHeight: number;
    entities: EntityMap[];
};

export type EntityMap = {
    tag?: string;
    group?: string;
    components: ComponentMap[];
};

export type ComponentMap = {
    name: string;
    properties: {
        [key: string]: any;
    };
};
