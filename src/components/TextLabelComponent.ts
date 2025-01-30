import Component from '../ecs/Component';
import { Vector } from '../types';

export default class TextLabelComponent extends Component {
    position: Vector;
    text: string;
    color: { r: number; g: number; b: number };
    isFixed: boolean;
    font: string;

    constructor(
        position = { x: 0, y: 0 },
        text = '',
        color = { r: 0, g: 0, b: 0 },
        isFixed = true,
        font = '14px Arial',
    ) {
        super();
        this.position = position;
        this.text = text;
        this.color = color;
        this.isFixed = isFixed;
        this.font = font;
    }
}
