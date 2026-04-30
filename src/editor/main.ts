import { RAFLoopStrategy } from '../engine';
import Editor from './Editor';

const editor = new Editor();
editor.setLoopStrategy(new RAFLoopStrategy(editor));
editor.run();
