import AssetStore from '../../engine/asset-store/AssetStore';
import System from '../../engine/ecs/System';
import EventBus from '../../engine/event-bus/EventBus';
import SoundComponent from '../components/SoundComponent';
import SoundEmitEvent from '../events/SoundEmitEvent';

export default class SoundSystem extends System {
    assetStore: AssetStore;

    constructor(assetStore: AssetStore) {
        super();
        this.requireComponent(SoundComponent);
        this.assetStore = assetStore;
    }

    subscribeToEvents = (eventBus: EventBus) => {
        eventBus.subscribeToEvent(SoundEmitEvent, this, this.onSoundEmit);
    };

    onSoundEmit = (event: SoundEmitEvent) => {
        const soundTrack = this.assetStore.getSound(event.soundAssetId);

        if (!soundTrack) {
            throw new Error(`Sound asset with ID ${event.soundAssetId} not found.`);
        }

        soundTrack.currentTime = 0;
        soundTrack.volume = event.volume;
        soundTrack.play().catch(error => console.error(`Failed to play sound: ${error}`));
    };
}
