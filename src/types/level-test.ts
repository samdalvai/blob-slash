import { LevelMap } from './maps';

const level: LevelMap = {
    tileMap: {
        tiles: [
            [1, 2, 3],
            [1, 2, 3],
            [1, 2, 3],
        ],
    },
    entities: [
        {
            tag: 'player',
            components: [
                {
                    name: 'animation',
                    properties: {
                        numFrames: 0,
                        currentFrame: 0,
                        frameSpeedRate: 0,
                        isLoop: false,
                        startTime: 0,
                    },
                },
            ],
        },
    ],
};
