import AssetStore from '../asset-store/AssetStore';
import SoundComponent from '../components/SoundComponent';
import System from '../ecs/System';
import EventBus from '../event-bus/EventBus';
import EntityHitEvent from '../events/EntityHitEvent';
import EntityKilledEvent from '../events/EntityKilledEvent';

export default class SoundSystem extends System {
    assetStore: AssetStore;

    constructor(assetStore: AssetStore) {
        super();
        this.requireComponent(SoundComponent);
        this.assetStore = assetStore;
    }

    subscribeToEvents = (eventBus: EventBus) => {
        eventBus.subscribeToEvent(EntityHitEvent, this, this.onEntityHit);
    };

    onEntityHit = (event: EntityHitEvent) => {
        // TODO: reproduce entity hit sound
    };

    async update(assetStore: AssetStore) {
        for (const entity of this.getSystemEntities()) {
            const sound = entity.getComponent(SoundComponent);

            if (!sound) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const soundTrack = assetStore.getSound(sound.assetId);

            if (!soundTrack) {
                throw new Error(`Sound asset with ID ${sound.assetId} not found.`);
            }

            if (soundTrack.currentTime === 0) {
                soundTrack.volume = sound.volume;
                soundTrack.play().catch(error => console.error(`Failed to play sound: ${error}`));
            }

            if (soundTrack.currentTime >= soundTrack.duration - sound.offsetBuffer) {
                soundTrack.currentTime = 0;
            }
        }
    }
}
