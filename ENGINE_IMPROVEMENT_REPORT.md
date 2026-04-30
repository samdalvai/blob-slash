# Engine Improvement Report

## Scope

This report reviews the engine code under `src/engine/**`.

The analysis intentionally skips implementation details under:

- `src/game/**`
- `src/editor/**`

Engine tests under `src/__tests__/engine/**` were used only as behavioral context.

## Executive Summary

The engine has a compact, readable ECS core and a clear separation between engine, game, and editor code. The main improvement opportunities are around lifecycle management, ECS ergonomics, serialization stability, and hot-path data structures.

Highest-value improvements:

1. Automatically reconcile ECS system membership when components are added or removed.
2. Replace reflection/name-based component serialization with stable `ComponentCatalog` metadata.
3. Add explicit cleanup APIs for `Engine`, `InputManager`, loop strategies, and event subscriptions.
4. Optimize system entity storage with entity-id indexes instead of repeated linear scans.
5. Parallelize level asset loading and reduce hot-path allocations/logging.

## API / User Interface Improvements

### 1. Make `Engine` initialization configurable

References:

- `src/engine/Engine.ts:42`
- `src/engine/Engine.ts:67`
- `src/engine/Engine.ts:75`
- `src/engine/Engine.ts:76`

Current behavior:

- `Engine.initialize()` directly queries `document.getElementById('game-canvas')`.
- The canvas cursor is always hidden with `canvas.style.cursor = 'none'`.
- The initial camera size is read from `window.innerWidth` and `window.innerHeight`.
- Global engine state is stored on static fields such as `Engine.mapWidth`, `Engine.mousePositionWorld`, and `Engine.gameStatus`.

Why this matters:

- It makes the engine harder to embed in another canvas or test in isolation.
- It assumes a specific DOM shape.
- It couples engine state to one runtime instance, making multiple engine instances difficult.

Suggested improvement:

Introduce an `EngineOptions` object:

```ts
type EngineOptions = {
    canvas?: HTMLCanvasElement;
    canvasId?: string;
    hideCursor?: boolean;
    initialCamera?: Rectangle;
    logger?: EngineLogger;
};
```

This would make the default path simple while allowing tests, editor tools, and other consumers to configure the engine without subclass hacks.

Priority: High

### 2. Add lifecycle cleanup APIs

References:

- `src/engine/Engine.ts:82`
- `src/engine/input-manager/InputManager.ts:13`
- `src/engine/input-manager/InputManager.ts:20`
- `src/engine/input-manager/InputManager.ts:22`
- `src/engine/loop-strategy/RAFLoopStrategy.ts:14`
- `src/engine/loop-strategy/FixedFPSLoopStrategy.ts:17`

Current behavior:

- `Engine` registers an anonymous `resize` listener and never removes it.
- `InputManager` registers global keyboard, mouse, wheel, and context menu listeners and never removes them.
- Loop strategies have no explicit stop or dispose contract.

Why this matters:

- Restarting the engine or switching between runtime contexts can leave duplicate listeners active.
- Tests and tooling can leak state between runs.
- Long-lived browser sessions can accumulate stale callbacks.

Suggested improvement:

Add lifecycle methods:

```ts
engine.stop();
engine.dispose();
inputManager.dispose();
loopStrategy.stop();
```

Store listener callbacks as instance fields so they can be removed reliably.

Priority: High

### 3. Clarify loop strategy semantics

References:

- `src/engine/loop-strategy/LoopStrategy.ts:10`
- `src/engine/loop-strategy/RAFLoopStrategy.ts:4`
- `src/engine/loop-strategy/FixedFPSLoopStrategy.ts:13`
- `src/engine/Engine.ts:160`

Current behavior:

- `LoopStrategy.start()` is implemented as a method that throws.
- `RAFLoopStrategy.start()` schedules the first frame and returns quickly.
- `FixedFPSLoopStrategy.start()` loops until the engine stops.
- `Engine.run()` awaits both strategies, even though their lifetimes differ.

Why this matters:

- The same `start()` API has different completion semantics.
- It is unclear when `run()` resolves.
- There is no shared cancellation mechanism.

Suggested improvement:

Make `LoopStrategy` an abstract class or interface:

```ts
interface LoopStrategy {
    start(): void;
    stop(): void;
}
```

Alternatively, make all strategies return a promise that resolves only after stop. The important point is that all strategies should share the same lifecycle contract.

Priority: Medium

### 4. Automatically update system membership when components change

Status: skipped

References:

- `src/engine/ecs/Registry.ts:264`
- `src/engine/ecs/Registry.ts:284`
- `src/engine/ecs/Registry.ts:391`
- `src/__tests__/engine/ecs/System.test.ts:95`
- `src/__tests__/engine/ecs/System.test.ts:111`
- `src/__tests__/engine/ecs/System.test.ts:135`

Current behavior:

- `Registry.addComponent()` updates the component pool and entity signature.
- `Registry.removeComponent()` updates the pool and signature.
- Neither method automatically adds/removes the entity from matching systems.
- Tests show users must call `entity.addToSystem()` or `entity.removeFromSystem()` manually after runtime component changes.

Why this matters:

- It makes ECS behavior harder to reason about.
- Users can easily forget to sync systems after mutating components.
- The deferred lifecycle already exists through `Registry.update()`, so this feels like a missing piece of the same model.

Suggested improvement:

Queue entities whose signatures changed:

```ts
entitiesWithChangedSignature: Set<Entity>;
```

Then reconcile membership in `Registry.update()`:

- For each changed entity, compare the entity signature with each system signature.
- Add the entity to newly matching systems.
- Remove the entity from systems that no longer match.

Priority: High

### 5. Hide mutable internals behind explicit APIs

Status: Done

References:

- `src/engine/ecs/Registry.ts:10`
- `src/engine/ecs/Registry.ts:14`
- `src/engine/ecs/Registry.ts:17`
- `src/engine/ecs/Registry.ts:20`
- `src/engine/ecs/Registry.ts:22`
- `src/engine/ecs/Registry.ts:33`

Current behavior:

`Registry` exposes much of its internal state as public mutable fields:

- `entities`
- `componentPools`
- `entityComponentSignatures`
- `systems`
- `entitiesToBeAdded`
- `entitiesToBeKilled`
- tag/group maps
- `freeIds`

Why this matters:

- External code can mutate core invariants.
- Tests currently depend on internals, which makes refactors harder.
- Engine users have to know too much about registry storage.

Suggested improvement:

Make fields private and expose focused queries:

```ts
registry.entityCount();
registry.getPendingEntityCount();
registry.getComponentPool(ComponentClass);
registry.getEntitySignature(entity);
registry.getSystemEntities(SystemClass);
```

Tests can migrate from direct field access to public behavior.

Priority: Medium

### 6. Return readonly system entity views

Status: done

References:

- `src/engine/ecs/System.ts:21`
- `src/engine/ecs/System.ts:49`

Current behavior:

`System.getSystemEntities()` returns the internal mutable entity array.

Why this matters:

- Callers can accidentally reorder, push, pop, or clear system-owned data.
- Future data structure changes become harder because consumers depend on arrays.

Suggested improvement:

Return a readonly array or iterator:

```ts
getEntities(): readonly Entity[];
entities(): Iterable<Entity>;
forEachEntity(callback: (entity: Entity) => void): void;
```

Priority: Medium

### 7. Replace fragile serialization reflection with catalog metadata

References:

- `src/engine/serialization/serialization.ts:14`
- `src/engine/serialization/serialization.ts:17`
- `src/engine/serialization/deserialization.ts:14`
- `src/engine/serialization/deserialization.ts:27`
- `src/engine/serialization/deserialization.ts:105`
- `src/engine/ecs/ComponentCatalog.ts:11`

Current behavior:

- Serialization uses `component.constructor.name`.
- Deserialization parses constructor parameter names from `ComponentClass.toString()`.
- A TODO notes that this can fail in production when code is minified or obfuscated.
- Engine-level serialization hard-codes special handling for `startTime` and `followedEntity`.

Why this matters:

- Constructor names are not stable build artifacts.
- Parsing JavaScript source strings is brittle.
- Domain-specific component rules leak into the engine.

Suggested improvement:

Make `ComponentCatalog` the stable serialization contract:

```ts
type ComponentDefinition<T extends Component = Component> = {
    name: string;
    constructor: ComponentClass<T>;
    fields?: ComponentFieldDefinition[];
    serialize?: (component: T) => Record<string, unknown>;
    deserialize?: (properties: Record<string, unknown>) => ConstructorParameters<ComponentClass<T>>;
    clone?: (component: T) => ConstructorParameters<ComponentClass<T>>;
};
```

Then require serialization/deserialization to go through the catalog instead of constructor names or reflection.

Priority: High

### 8. Make tag and group semantics more explicit

References:

- `src/engine/ecs/Registry.ts:158`
- `src/engine/ecs/Registry.ts:187`
- `src/engine/ecs/Registry.ts:203`
- `src/engine/ecs/Registry.ts:239`

Current behavior:

- One tag can point to only one entity.
- One entity can have only one tag.
- One entity can belong to only one group according to `groupPerEntity`.
- Calling `tagEntity()` or `groupEntity()` again does not first clear old reverse mappings.

Why this matters:

- Retagging or regrouping an entity can leave stale maps.
- The method names `tag()` and `group()` do not communicate whether they add, replace, or fail.

Suggested improvement:

Rename or add explicit methods:

```ts
entity.setTag(tag);
entity.clearTag();
entity.setGroup(group);
entity.clearGroup();
```

If multi-group membership is desired later, add dedicated methods:

```ts
entity.addToGroup(group);
entity.removeFromGroup(group);
```

Priority: Medium

### 9. Add EventBus unsubscribe and stronger keys

References:

- `src/engine/event-bus/EventBus.ts:22`
- `src/engine/event-bus/EventBus.ts:37`
- `src/engine/event-bus/EventBus.ts:45`

Current behavior:

- Subscribers are stored by `eventType.name`.
- There is no way to unsubscribe one subscriber.
- `reset()` clears all subscriptions.

Why this matters:

- Class names are unstable under minification.
- Unsubscribing all subscribers is too coarse for many lifecycle flows.
- Systems or UI tools cannot safely bind/unbind temporary listeners.

Suggested improvement:

Use event constructors as keys:

```ts
private subscribers = new Map<new (...args: any[]) => GameEvent, IEventCallback[]>();
```

Return an unsubscribe function:

```ts
const unsubscribe = eventBus.subscribeToEvent(MyEvent, owner, owner.onEvent);
unsubscribe();
```

Priority: Medium

### 10. Give AssetStore clearer loading and retrieval contracts

References:

- `src/engine/asset-store/AssetStore.ts:7`
- `src/engine/asset-store/AssetStore.ts:21`
- `src/engine/asset-store/AssetStore.ts:43`
- `src/engine/asset-store/AssetStore.ts:91`
- `src/engine/asset-store/AssetStore.ts:119`

Current behavior:

- JSON storage is typed as `any`.
- Missing textures silently fall back to `DEFAULT_SPRITE`.
- Missing sounds and JSON throw errors.
- Asset file path arrays are mutable internal arrays returned directly.

Why this matters:

- Different missing-asset policies are easy to miss.
- `getJson()` loses type information.
- External code can mutate the returned path arrays.

Suggested improvement:

Add typed APIs and make fallback behavior explicit:

```ts
getJson<T>(assetId: string): T;
getTexture(assetId: string, options?: { fallback?: boolean }): HTMLImageElement;
getTexturesFilePaths(): readonly Asset[];
```

Priority: Medium

### 11. Separate loaded level JSON from runtime asset clearing

References:

- `src/engine/level-manager/LevelManager.ts:24`
- `src/engine/level-manager/LevelManager.ts:29`
- `src/engine/level-manager/LevelManager.ts:34`
- `src/engine/asset-store/AssetStore.ts:127`

Current behavior:

- `addLevelToAssets()` stores level JSON in `AssetStore`.
- `loadLevelFromLevelMap()` clears the entire `AssetStore`.
- Clearing removes textures, sounds, and JSON.

Why this matters:

- A level loaded from assets can clear cached assets during level transitions.
- Runtime assets and level metadata have different lifetimes.

Suggested improvement:

Either:

- keep level JSON outside `AssetStore`, or
- split `AssetStore.clear()` into `clearRuntimeAssets()`, `clearJsons()`, and `clearAll()`.

Priority: Medium

### 12. Harden utility functions and validation

References:

- `src/engine/utils/vector.ts:6`
- `src/engine/utils/vector.ts:10`
- `src/engine/utils/vector.ts:67`
- `src/engine/utils/vector.ts:77`
- `src/engine/utils/validation.ts:3`
- `src/engine/utils/validation.ts:17`

Current behavior:

- `computeDirectionVector()` divides by zero if both points are identical.
- `isVector()` and `isRectangle()` call `Object.keys(obj)` before checking whether `obj` is non-null.
- `isValidLevelMap()` checks that required properties exist but does not validate that arrays are arrays.
- `isValidEntityMap()` checks `obj.components !== null` but not that `obj` itself is non-null or that `components` is an array.

Why this matters:

- Utilities can throw unexpectedly on malformed input.
- Runtime validation can accept invalid maps.

Suggested improvement:

Define exact behavior for zero-distance direction vectors:

- return `{ x: 0, y: 0 }`, or
- throw a descriptive error.

Also harden type guards with null checks and `Array.isArray`.

Priority: Medium

## Performance Improvements

### 1. Replace linear system entity removal with O(1) removal

Status: Done

References:

- `src/engine/ecs/System.ts:21`
- `src/engine/ecs/System.ts:40`
- `src/engine/ecs/Registry.ts:415`

Current behavior:

- `System.removeEntityFromSystem()` uses `this.entities.indexOf(entity)`.
- `Registry.removeEntityFromSystems()` attempts removal from every system.

Why this matters:

Removing killed entities can become expensive:

```txt
killed entities * systems * average entities per system
```

Suggested improvement:

Store an entity-id index inside each `System`:

```ts
private entityIdToIndex = new Map<number, number>();
```

Then use swap-remove while updating the moved entity's index.

Expected impact: High for scenes with many entities or frequent entity destruction.

Priority: High

### 2. Avoid scanning every system for every added entity

Status: Skipped

References:

- `src/engine/ecs/Registry.ts:391`
- `src/engine/ecs/Registry.ts:396`
- `src/engine/ecs/Registry.ts:405`

Current behavior:

- `Registry.addEntityToSystems()` checks every registered system against the entity signature.

Why this matters:

This is simple and often acceptable, but it scales with:

```txt
new entities * systems
```

Suggested improvement:

Maintain an index from component IDs or system signatures to candidate systems. A simple first step is to group systems by one required component, usually the rarest required component if such metadata is available.

Expected impact: Medium to high when there are many systems and many spawned entities.

Priority: Medium

### 3. Remove components by signature bits instead of scanning all pools

Status: Skipped

References:

- `src/engine/ecs/Registry.ts:57`
- `src/engine/ecs/Registry.ts:61`
- `src/engine/ecs/Registry.ts:64`

Current behavior:

When killing an entity, `Registry.update()` loops over all component pools and calls `removeEntityFromPool()` if the pool exists.

Why this matters:

The engine already has an entity signature that identifies which component types the entity has. Scanning all component pools does unnecessary work for entities with a small number of components.

Suggested improvement:

Iterate only set bits in the entity signature:

```ts
let signature = entitySignature.signature;
while (signature !== 0) {
    const componentId = /* next set bit */;
    pools[componentId]?.remove(entityId);
    signature &= signature - 1;
}
```

Expected impact: Medium for many component types or frequent entity destruction.

Priority: Medium

### 4. Move entity and ECS methods from arrow fields to prototypes

Status: Done

References:

- `src/engine/ecs/Entity.ts:17`
- `src/engine/ecs/Entity.ts:21`
- `src/engine/ecs/Entity.ts:61`
- `src/engine/ecs/System.ts:36`
- `src/engine/ecs/Registry.ts:50`

Current behavior:

Many class methods are declared as arrow fields. This creates one function per instance.

Why this matters:

- `Entity` instances can be numerous.
- Per-instance closures increase memory usage.
- Prototype methods are shared between instances.

Suggested improvement:

Use prototype methods for classes that can have many instances:

```ts
getId() {
    return this.id;
}
```

Keep arrow fields only where callback binding is required.

Expected impact: Medium for memory usage and allocation pressure.

Priority: Medium

### 5. Consider arrays instead of `Map` for pool indexes

Status: Done

References:

- `src/engine/ecs/Pool.ts:8`
- `src/engine/ecs/Pool.ts:9`
- `src/engine/ecs/Pool.ts:34`
- `src/engine/ecs/Pool.ts:49`

Current behavior:

`Pool` stores:

- `entityIdToIndex: Map<number, number>`
- `indexToEntityId: Map<number, number>`

Why this matters:

Entity IDs are dense numeric IDs managed by `Registry`. Arrays are usually faster and lighter than maps for dense integer keys.

Suggested improvement:

Consider:

```ts
private entityIdToIndex: number[] = [];
private indexToEntityId: number[] = [];
```

Use `-1` or `undefined` as the missing sentinel.

Expected impact: Medium for hot component access/removal paths.

Priority: Medium

### 6. Avoid console logging in hot or common control paths

References:

- `src/engine/ecs/Registry.ts:109`
- `src/engine/ecs/Pool.ts:54`
- `src/engine/ecs/Pool.ts:66`
- `src/engine/ecs/Pool.ts:89`
- `src/engine/asset-store/AssetStore.ts:27`
- `src/engine/asset-store/AssetStore.ts:68`
- `src/engine/asset-store/AssetStore.ts:100`

Current behavior:

- Missing pool entries emit warnings.
- Duplicate kill attempts log to the console.
- Asset loading logs every successful load.

Why this matters:

Console output is expensive and noisy, especially in browser devtools. Some missing component lookups are normal control flow because `getComponent()` returns `undefined`.

Suggested improvement:

Introduce a configurable logger and log levels:

```ts
type EngineLogger = {
    debug(message: string): void;
    warn(message: string): void;
    error(message: string): void;
};
```

For component retrieval, split APIs:

```ts
tryGet(entityId): T | undefined;
require(entityId): T;
```

Expected impact: Medium, especially during development and heavy input/entity churn.

Priority: Medium

### 7. Cache or remove constructor reflection

References:

- `src/engine/serialization/deserialization.ts:105`
- `src/engine/serialization/deserialization.ts:106`
- `src/engine/serialization/deserialization.ts:108`
- `src/engine/ecs/Registry.ts:129`

Current behavior:

Constructor parameter names are parsed by stringifying the component class and running regex/string processing.

Why this matters:

- It is expensive relative to explicit metadata.
- It happens during deserialization and duplication.
- It is fragile under minification.

Suggested improvement:

Best option: remove this reflection by requiring catalog metadata for serialization/deserialization.

Interim option: cache by constructor:

```ts
const constructorParamCache = new WeakMap<ComponentClass, string[]>();
```

Expected impact: Medium for loading/duplicating many entities.

Priority: High if serialization is used in production builds; otherwise Medium.

### 8. Parallelize level asset loading

References:

- `src/engine/level-manager/LevelManager.ts:45`
- `src/engine/level-manager/LevelManager.ts:50`
- `src/engine/level-manager/LevelManager.ts:54`

Current behavior:

Textures and sounds are awaited sequentially.

Why this matters:

Level load time scales with the sum of asset request/load times instead of the slowest group of parallel requests.

Suggested improvement:

Load independent assets with `Promise.all`:

```ts
await this.assetStore.addTexture(DEFAULT_SPRITE, './assets/sprites/default.png');

await Promise.all([
    ...level.textures.map(texture => this.assetStore.addTexture(texture.assetId, texture.filePath)),
    ...level.sounds.map(sound => this.assetStore.addSound(sound.assetId, sound.filePath)),
]);
```

Expected impact: High for levels with many assets.

Priority: High

### 9. Use the RAF timestamp to avoid extra `performance.now()` calls

Status: Done

References:

- `src/engine/loop-strategy/RAFLoopStrategy.ts:5`
- `src/engine/loop-strategy/RAFLoopStrategy.ts:7`
- `src/engine/loop-strategy/RAFLoopStrategy.ts:10`
- `src/engine/loop-strategy/RAFLoopStrategy.ts:12`

Current behavior:

`RAFLoopStrategy` calls `performance.now()` to compute delta time and again after the frame.

Why this matters:

The browser already provides a high-resolution timestamp to `requestAnimationFrame`.

Suggested improvement:

```ts
const loop = (timestamp: number) => {
    if (!this.engine.running()) return;

    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    this.engine.runFrame(deltaTime);
    requestAnimationFrame(loop);
};
```

Expected impact: Low but simple and cleaner.

Priority: Low

### 10. Normalize and coalesce input events

References:

- `src/engine/input-manager/InputManager.ts:2`
- `src/engine/input-manager/InputManager.ts:27`
- `src/engine/input-manager/InputManager.ts:31`
- `src/engine/input-manager/InputManager.ts:35`

Current behavior:

Input buffers store raw DOM event objects:

- `KeyboardEvent[]`
- `MouseEvent[]`
- `WheelEvent[]`

Why this matters:

- Raw DOM events are larger than the engine typically needs.
- Mouse move and wheel events can fire at high frequency.
- Buffers can grow if the engine frame stalls.

Suggested improvement:

Store normalized engine input events:

```ts
type EngineInputEvent =
    | { type: 'keyDown'; code: string; repeat: boolean }
    | { type: 'keyUp'; code: string }
    | { type: 'mouseMove'; x: number; y: number }
    | { type: 'mouseDown'; button: MouseButton; x: number; y: number }
    | { type: 'mouseUp'; button: MouseButton; x: number; y: number }
    | { type: 'wheel'; deltaY: number };
```

Also consider coalescing:

- keep only the latest mouse move per frame,
- accumulate wheel delta,
- expose `consumeKeyboardEvents()`, `consumeMouseEvents()`, and `clear()`.

Expected impact: Medium for input-heavy scenes and editor-like tools.

Priority: Medium

### 11. Avoid unnecessary array copies in common getters

References:

- `src/engine/ecs/Registry.ts:229`
- `src/engine/ecs/Registry.ts:236`
- `src/engine/ecs/ComponentCatalog.ts:53`
- `src/engine/serialization/serialization.ts:50`

Current behavior:

- `getEntitiesByGroup()` returns `[...currentEntities]`.
- `ComponentCatalog.list()` returns `[...definitions]`.
- `serializeLevel()` converts an iterator to an array before serializing.

Why this matters:

Copies are fine for occasional use, but some getters may be used repeatedly by tools or systems.

Suggested improvement:

Expose iterable or readonly views:

```ts
getEntitiesByGroup(group): Iterable<Entity>;
componentCatalog.list(): readonly ComponentDefinition[];
serializeEntities(entities: Iterable<Entity>): EntityMap[];
```

Expected impact: Low to medium depending on call frequency.

Priority: Low

### 12. Avoid `Math.pow` for simple squared distances

References:

- `src/engine/utils/circle.ts:8`

Current behavior:

`isPointInsideCircle()` uses `Math.pow(pointX - circleX, 2)`.

Why this matters:

Multiplication is faster and clearer for squaring simple values.

Suggested improvement:

```ts
const dx = pointX - circleX;
const dy = pointY - circleY;
return dx * dx + dy * dy <= circleRadius * circleRadius;
```

Expected impact: Low, but useful if called frequently for collision or targeting checks.

Priority: Low

## Suggested Implementation Order

### Phase 1: Correctness and ergonomics

1. Add `Engine.stop()` / `Engine.dispose()` and `InputManager.dispose()`.
2. Clarify `LoopStrategy` lifecycle.
3. Automatically reconcile system membership after component add/remove.
4. Add EventBus unsubscribe support.

### Phase 2: Serialization stability

1. Move serialization names and field handling into `ComponentCatalog`.
2. Remove constructor string parsing from the default deserialization path.
3. Replace engine-specific `startTime` and `followedEntity` serialization rules with component-level serializers.

### Phase 3: ECS performance

1. [x] Add O(1) system entity removal.
2. [x] Remove killed entity components by signature bits.
3. [x] Consider array-backed pool indexes.
4. [x] Move high-count class methods to prototypes.

### Phase 4: Loading and utility cleanup

1. Parallelize level asset loading.
2. Normalize/coalesce input buffers.
3. Harden validation/type guards.
4. Add logger configuration and reduce console output.

## Notes

The current design is intentionally small and approachable, which is a strength. The recommendations above should be introduced incrementally, with tests around observable behavior before changing storage internals. The best first changes are the ones that improve both correctness and usability without changing the public mental model: lifecycle cleanup, automatic system membership reconciliation, and stable catalog-based serialization.
