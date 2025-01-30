import Component from '../ecs/Component';

export default class CameraShakeComponent extends Component {
    shakeDuration: number;

    constructor(shakeDuration = 0) {
        super();
        this.shakeDuration = shakeDuration;
    }
}
