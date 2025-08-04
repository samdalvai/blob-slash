import Editor from './editor/Editor';
import FixedFPSLoopStrategy from './engine/loop-strategy/FixedFPSLoopStrategy';
import RAFLoopStrategy from './engine/loop-strategy/RAFLoopStrategy';
import Game from './game/Game';

const isEditor = Boolean(process.env.IS_EDITOR) || false;

if (!isEditor) {
    const game = new Game();
    game.setLoopStrategy(new RAFLoopStrategy(game));
    // game.setLoopStrategy(new FixedFPSLoopStrategy(game, 60));
    game.run();
} else {
    const editor = new Editor();
    editor.setLoopStrategy(new RAFLoopStrategy(editor));
    // editor.setLoopStrategy(new FixedFPSLoopStrategy(editor, 60));
    editor.run();
}
