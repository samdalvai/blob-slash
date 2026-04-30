import { System, GameStatus } from '../../engine';
import Game from '../Game';
import { HealthComponent } from '../components';

export default class GameEndSystem extends System {
    constructor() {
        super();
        this.requireComponent(HealthComponent);
    }

    update() {
        let numberOfEnemies = 0;
        let isPlayerAlive = false;

        for (const entity of this.getSystemEntities()) {
            if (entity.belongsToGroup('enemies')) {
                numberOfEnemies++;
            }

            if (entity.hasTag('player')) {
                isPlayerAlive = true;
            }
        }

        if (numberOfEnemies == 0 && Game.gameStatus !== GameStatus.WON) {
            Game.gameStatus = GameStatus.WON;
            return;
        }

        if (!isPlayerAlive && Game.gameStatus !== GameStatus.LOST) {
            Game.gameStatus = GameStatus.LOST;
        }
    }
}
