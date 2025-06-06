import Game from './game/Game';

const isEditor = Boolean(process.env.IS_EDITOR) || false;

console.log('is editor: ', isEditor);

const game = new Game();

game.initialize();
game.run();
