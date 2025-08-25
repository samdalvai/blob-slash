import Component from '../../engine/ecs/Component';
import { Vector } from '../../engine/types/utils';

export default class TextLabelComponent extends Component {
    offset: Vector;
    text: string;
    color: { r: number; g: number; b: number };
    fontSize: number;
    fontFamily: string;

    constructor(
        offset = { x: 0, y: 0 },
        text = '',
        color = { r: 0, g: 0, b: 0 },
        fontSize = 14,
        fontFamily = 'Arial',
    ) {
        super();
        this.offset = offset;
        this.text = text;
        this.color = color;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
    }
}
