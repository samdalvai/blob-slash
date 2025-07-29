import { LevelMap } from '../../engine/types/map';
import * as GameSystems from '../../game/systems';

export type EditorSettings = {
    activeSystems: Record<keyof typeof GameSystems, boolean>;
    snapToGrid: boolean;
    showGrid: boolean;
    gridSquareSide: number;
    selectedLevel: string | null;
};

export type LevelVersion = {
    date: string;
    snapShot: LevelMap;
    current: boolean;
};

export type LevelHistory = {
    [key: string]: LevelVersion[];
};
