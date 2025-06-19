import Editor from './editor/Editor';
import Game from './game/Game';

const isEditor = Boolean(process.env.IS_EDITOR) || false;

if (!isEditor) {
    const game = new Game();

    game.initialize();
    game.run();
} else {
    const editor = new Editor();

    editor.initialize();
    editor.run();
}
