import AssetStore from '../../core/asset-store/AssetStore';
import SoundComponent from '../components/SoundComponent';
import System from '../../core/ecs/System';
import EventBus from '../../core/event-bus/EventBus';
import EntityHitEvent from '../events/EntityHitEvent';
import SoundEmitEvent from '../events/SoundEmitEvent';

export default class SoundSystem extends System {
    assetStore: AssetStore;

    constructor(assetStore: AssetStore) {
        super();
        this.requireComponent(SoundComponent);
        this.assetStore = assetStore;
    }

    subscribeToEvents = (eventBus: EventBus) => {
        eventBus.subscribeToEvent(EntityHitEvent, this, this.onEntityHit);
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

    onEntityHit = () => {
        const hitSound = this.assetStore.getSound('entity-hit-sound');
        if (!hitSound) {
            throw new Error('Could not find explosion sound');
        }
        if (hitSound.currentTime !== 0) {
            hitSound.currentTime = 0;
        }
        hitSound.volume = 0.25;
        hitSound.play().catch(error => console.error(`Failed to play sound: ${error}`));
    };
}
