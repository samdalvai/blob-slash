export default class InputManager {
    keyboardInputBuffer: KeyboardEvent[];
    mouseInputBuffer: MouseEvent[];
    wheelInputBuffer: WheelEvent[];

    lastWheelEventTime = 0;

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
            event.preventDefault();
        });
    }

    private handleKeyboardEvent = (event: KeyboardEvent) => {
        this.keyboardInputBuffer.push(event);
    };

    private handleMouseEvent = (event: MouseEvent) => {
        this.mouseInputBuffer.push(event);
    };

    private handleWheelEvent = (event: WheelEvent) => {
        // Wheel events for mousepads are triggered much faster compared to mouse wheels
        // whith this logic we prevent scrolling too fast on mouse pads
        if (performance.now() - this.lastWheelEventTime < 25) {
            return;
        }

        this.wheelInputBuffer.push(event);
        this.lastWheelEventTime = performance.now();
    };
}
