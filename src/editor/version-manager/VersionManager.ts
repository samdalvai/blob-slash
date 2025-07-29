import { LevelMap } from '../../engine/types/map';

export default class VersionManager {
    private levelVersions: Map<string, LevelMap[]>;
    private levelVersionIndex: Map<string, number>;

    constructor() {
        this.levelVersions = new Map();
        this.levelVersionIndex = new Map();
    }

    addLevelVersion = (levelId: string, level: LevelMap) => {
        const currentVersions = this.levelVersions.get(levelId);
        const currentLevelVersionIndex = this.levelVersionIndex.get(levelId);

        if (!currentVersions) {
            this.levelVersions.set(levelId, [level]);
            this.levelVersionIndex.set(levelId, 0);
            return;
        }

        if (currentLevelVersionIndex === undefined) {
            throw new Error('No version index defined for level with id ' + levelId);
        }

        this.levelVersionIndex.set(levelId, currentLevelVersionIndex + 1);
        currentVersions.push(level);
    };

    getLevelVersions = (levelId: string) => {
        return this.levelVersions.get(levelId);
    };

    getLevelVersionIndex = (levelId: string) => {
        return this.levelVersionIndex.get(levelId);
    };

    getCurrentLevelVersion = (levelId: string) => {
        const currentVersions = this.levelVersions.get(levelId);
        const currentLevelVersionIndex = this.levelVersionIndex.get(levelId);

        if (!currentVersions || currentLevelVersionIndex === undefined) {
            throw new Error('Could not find any version for level with id ' + levelId);
        }

        return currentVersions[currentLevelVersionIndex];
    };
}
