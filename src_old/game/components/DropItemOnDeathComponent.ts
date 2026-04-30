import { Component } from '../../engine';

export default class DropItemOnDeathComponent extends Component {
    droppedItem: string;
    droppedItemValue: number;
    dropPercentage: number;

    constructor(droppedItem = '', droppedItemValue = 0, dropPercentage = 0) {
        super();
        this.droppedItem = droppedItem;
        this.droppedItemValue = droppedItemValue;
        this.dropPercentage = dropPercentage;
    }
}
