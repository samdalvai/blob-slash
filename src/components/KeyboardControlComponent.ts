import Component from '../ecs/Component';

export default class KeyboardControlComponent extends Component {
    upVelocity: number;
    rightVelocity: number;
    downVelocity: number;
    leftVelocity: number;

    constructor(upVelocity = 0, rightVelocity = 0, downVelocity = 0, leftVelocity = 0) {
        super();
        this.upVelocity = upVelocity;
        this.rightVelocity = rightVelocity;
        this.downVelocity = downVelocity;
        this.leftVelocity = leftVelocity;
    }
}
