export default class InputManager {
    keyboardInputBuffer: KeyboardEvent[];
    mouseInputBuffer: MouseEvent[];
    wheelInputBuffer: WheelEvent[];

    constructor() {
        this.keyboardInputBuffer = [];
        this.mouseInputBuffer = [];
        this.wheelInputBuffer = [];

        window.addEventListener('keydown', this.handleKeyboardEvent);
        window.addEventListener('keyup', this.handleKeyboardEvent);

        window.addEventListener('mousemove', this.handleMouseEvent);
        window.addEventListener('mousedown', this.handleMouseEvent);
        window.addEventListener('mouseup', this.handleMouseEvent);

        window.addEventListener('wheel', this.handleWheelEvent);

        window.addEventListener('contextmenu', function (event) {
            //event.preventDefault();
        });
    }

    handleKeyboardEvent = (event: KeyboardEvent) => {
        this.keyboardInputBuffer.push(event);
    };

    handleMouseEvent = (event: MouseEvent) => {
        this.mouseInputBuffer.push(event);
    };

    handleWheelEvent = (event: WheelEvent) => {
        this.wheelInputBuffer.push(event);
    };
}
