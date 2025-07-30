import { LevelMap } from '../../engine/types/map';

export default class VersionManager {
    private levelVersions: Map<string, string[]>;
    private levelVersionIndex: Map<string, number>;

    constructor() {
        this.levelVersions = new Map();
        this.levelVersionIndex = new Map();
    }

    // TODO [BUG]: components having objects as properties are saved in the same way across versions
    // as a workaround we stringify the level
    addLevelVersion = (levelId: string, level: LevelMap) => {
        const currentVersions = this.levelVersions.get(levelId);
        const currentLevelVersionIndex = this.levelVersionIndex.get(levelId);

        if (!currentVersions) {
            this.levelVersions.set(levelId, [JSON.stringify(level)]);
            this.levelVersionIndex.set(levelId, 0);
            return;
        }

        if (currentLevelVersionIndex === undefined) {
            throw new Error('No version index defined for level with id ' + levelId);
        }

        currentVersions.push(JSON.stringify(level));
        this.levelVersionIndex.set(levelId, currentVersions.length - 1);
    };

    getLevelVersions = (levelId: string) => {
        return this.levelVersions.get(levelId);
    };

    getLevelVersionIndex = (levelId: string) => {
        return this.levelVersionIndex.get(levelId);
    };

    getCurrentLevelVersion = (levelId: string): LevelMap => {
        const currentVersions = this.levelVersions.get(levelId);
        const currentLevelVersionIndex = this.levelVersionIndex.get(levelId);

        console.log('returning level version with index: ', currentLevelVersionIndex);

        if (!currentVersions || currentLevelVersionIndex === undefined) {
            throw new Error('Could not find any version for level with id ' + levelId);
        }

        const currentVersionJson = currentVersions[currentLevelVersionIndex];
        return JSON.parse(currentVersionJson) as LevelMap;
    };

    setNextLevelVersion = (levelId: string) => {
        const currentVersions = this.levelVersions.get(levelId);
        const currentLevelVersionIndex = this.levelVersionIndex.get(levelId);

        if (!currentVersions || currentLevelVersionIndex === undefined) {
            throw new Error('Could not find any version for level with id ' + levelId);
        }

        const nextLevelVersionIndex =
            currentLevelVersionIndex === currentVersions.length - 1
                ? currentLevelVersionIndex
                : currentLevelVersionIndex + 1;
        this.levelVersionIndex.set(levelId, nextLevelVersionIndex);
        console.log('levelVersionIndex: ', this.levelVersionIndex);
    };

    setPreviousLevelVersion = (levelId: string) => {
        const currentVersions = this.levelVersions.get(levelId);
        const currentLevelVersionIndex = this.levelVersionIndex.get(levelId);

        if (!currentVersions || currentLevelVersionIndex === undefined) {
            throw new Error('Could not find any version for level with id ' + levelId);
        }

        const previousLevelVersionIndex =
            currentLevelVersionIndex === 0 ? currentLevelVersionIndex : currentLevelVersionIndex - 1;
        this.levelVersionIndex.set(levelId, previousLevelVersionIndex);
        console.log('levelVersionIndex: ', this.levelVersionIndex);
    };
}
