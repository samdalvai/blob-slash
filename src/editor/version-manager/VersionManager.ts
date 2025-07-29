import { LevelMap } from '../../engine/types/map';
import { LevelVersion } from '../types';

export default class VersionManager {
    private levelVersions: Map<string, LevelVersion[]>;

    constructor() {
        this.levelVersions = new Map();
    }

    getLevelVersions = (levelId: string) => {
        return this.levelVersions.get(levelId);
    };

    addLevelVersion = (levelId: string, level: LevelMap) => {
        const currentVersions = this.levelVersions.get(levelId);
        const newVersion: LevelVersion = {
            date: new Date(),
            snapShot: level,
            current: false,
        };

        if (!currentVersions) {
            this.levelVersions.set(levelId, [newVersion]);
        } else {
            currentVersions.push(newVersion);
        }
    };
}
