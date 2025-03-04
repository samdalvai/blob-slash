export default class InputManager {
    keyboardInputBuffer: KeyboardEvent[];
    mouseInputBuffer: MouseEvent[];

    constructor() {
        this.keyboardInputBuffer = [];
        this.mouseInputBuffer = [];

        window.addEventListener('keydown', this.handleKeyboardEvent);
        window.addEventListener('keyup', this.handleKeyboardEvent);
        window.addEventListener('mousemove', this.handleMouseEvent);
        window.addEventListener('mousedown', this.handleMouseEvent);
        window.addEventListener('mouseup', this.handleMouseEvent);
    }

    handleKeyboardEvent = (event: KeyboardEvent) => {
        this.keyboardInputBuffer.push(event);
    };

    handleMouseEvent = (event: MouseEvent) => {
        this.mouseInputBuffer.push(event);
    };
}
