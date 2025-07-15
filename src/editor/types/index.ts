import * as GameSystems from '../../game/systems';

export type EditorSettings = {
    activeSystems: Record<keyof typeof GameSystems, boolean>;
    snapToGrid: boolean;
    showGrid: boolean;
    gridSquareSide: number;
};
