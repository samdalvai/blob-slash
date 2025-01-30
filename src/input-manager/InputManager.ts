export default class InputManager {
    keyboardInputBuffer: KeyboardEvent[];
    mouseInputBuffer: MouseEvent[];
    mousePosition: { x: number; y: number };

    constructor() {
        this.keyboardInputBuffer = [];
        this.mouseInputBuffer = [];
        this.mousePosition = { x: 0, y: 0 };

        window.addEventListener('keydown', this.handleKeyboardEvent);
        window.addEventListener('keyup', this.handleKeyboardEvent);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('click', this.handleMouseClick);
    }

    handleKeyboardEvent = (event: KeyboardEvent) => {
        this.keyboardInputBuffer.push(event);
    };

    handleMouseMove = (event: MouseEvent) => {
        this.mousePosition = { x: event.clientX, y: event.clientY };
    };

    handleMouseClick = (event: MouseEvent) => {
        this.mouseInputBuffer.push(event);
    };
}
