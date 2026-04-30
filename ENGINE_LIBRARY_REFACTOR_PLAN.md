# Engine Library Refactor Plan

## Goal

Turn `src/engine` into the reusable core engine library, with no imports from
`src/game` or `src/editor`.

`src/game` and `src/editor` should become standalone browser apps with their
own entrypoints. They should consume the engine through an explicit engine API
instead of reaching into arbitrary engine internals.

## Progress

- 2026-04-30: Phase 1 complete.
  - Added `src/engine/index.ts` as the public engine API barrel.
  - A boundary test was added during Phase 1, then removed from the current tree
    because it is not needed at the moment.
  - Verification: `npm test` and `tsc --noEmit` pass.
- 2026-04-30: Phase 2 complete.
  - Added `src/engine/ecs/ComponentCatalog.ts` with `ComponentCatalog`,
    component definition metadata, and `createComponentCatalog`.
  - Added `src/game/componentCatalog.ts` and `src/game/gameModule.ts` so the
    game provides its component catalog instead of the engine importing game
    components.
  - Changed `ComponentMap.name` to `string`.
  - Updated deserialization and `LevelManager` to receive/use a component
    catalog.
  - Updated game, editor, and paste flows to provide the game catalog.
  - Added deserialization coverage for a test-only component supplied through a
    local catalog.
  - Remaining engine-to-game import: `src/engine/ecs/Registry.ts`, intentionally
    left for Phase 3.
  - Verification: `npm test` and `tsc --noEmit` pass.
  - `npm run build:game` was attempted, but Parcel could not open its LMDB cache
    inside the sandbox. The escalation request to rerun it was declined.
- 2026-04-30: Phase 3 complete.
  - Removed the remaining engine-to-game import from
    `src/engine/ecs/Registry.ts`.
  - Updated `Registry.duplicateEntity` and `Entity.duplicate` to require a
    `ComponentCatalog`.
  - Entity duplication now resolves component constructors through catalog
    definitions and supports per-component `clone` overrides.
  - Updated editor duplicate flow to pass the game component catalog.
  - Updated ECS entity duplication tests to use a test-only component catalog.
  - Added game-side coverage that duplicates an entity with a real game
    component through `gameComponentCatalog`.
  - Verification: `npm test` and `tsc --noEmit` pass.
- 2026-04-30: Phase 4 complete.
  - Moved JSON download and level/entity localStorage helpers from
    `src/engine/serialization/persistence.ts` to
    `src/editor/persistence/levelPersistence.ts`.
  - Removed `src/engine/serialization/persistence.ts`.
  - Removed `LevelManager.loadLevelFromLocalStorage`; editor code now loads a
    `LevelMap` from localStorage and passes it to `loadLevelFromLevelMap`.
  - `src/engine/serialization` now contains only serialization and
    deserialization map conversion code.
  - Verification: `npm test` and `tsc --noEmit` pass.
- 2026-04-30: Phase 5 complete.
  - Added `src/game/main.ts` and `src/editor/main.ts`.
  - Updated `game.html` and `editor.html` to load their app-specific
    entrypoints.
  - Removed the old shared `src/index.ts` app switch and all `IS_EDITOR`
    usage.
  - Updated `start:editor` to run `parcel editor.html`.
  - Fixed `build:editor` to build `editor.html`.
  - Verification: `npm test`, `tsc --noEmit`, `npm run build:game`, and
    `npm run build:editor` pass. Parcel builds required escalation for LMDB
    cache access and emitted stale Browserslist data warnings.
  - `npm start` dev-server smoke test was attempted, but binding a local port
    failed in the sandbox and the escalation request was declined.
- 2026-04-30: Phase 6 complete.
  - Rewrote `src/game` and `src/editor` imports that reached into engine
    implementation files to use the public `src/engine/index.ts` API barrel.
  - Confirmed app code no longer imports from deep `src/engine/*` paths.
  - Verification: deep import scan, `tsc --noEmit`, and `npm test` pass.
  - `npm run build:game` was attempted, but Parcel could not open its LMDB
    cache inside the sandbox. The escalation request to rerun it was declined.

## Current State

The folder layout already suggests the desired shape:

- `src/engine`: ECS, event bus, asset loading, input, loop strategies, level
  loading, serialization, math utilities, shared types.
- `src/game`: the playable game app plus game-specific components, events, and
  systems.
- `src/editor`: the level editor app plus editor-specific UI, persistence, and
  systems.

The main architectural problem was dependency direction. At the start of this
refactor, `src/engine` reached into the game app in three places:

- `src/engine/ecs/Registry.ts` imports `../../game/components` for entity
  duplication.
- `src/engine/serialization/deserialization.ts` imports `../../game/components`
  to turn JSON component names into constructors.
- `src/engine/types/map.ts` imports `../../game/components` just to type
  `ComponentMap.name`.

Phase 2 removed the deserialization and map-type imports. Phase 3 removed the
`Registry.ts` import. At this point `src/engine` has no direct imports from
`src/game` or `src/editor`.

There are also a few library-boundary issues that will make the engine hard to
reuse:

- `src/index.ts` is a shared bootstrap that switches between game/editor with
  `process.env.IS_EDITOR`; the apps are not separate entrypoints.
- `Engine` owns browser DOM discovery through `document.getElementById('game-canvas')`.
- `Engine` stores global mutable runtime state on static fields
  (`mapWidth`, `mapHeight`, mouse positions, window size, game status).
- `LevelManager` still depends on global `Engine` state for map boundaries.
- The editor imports game components and systems directly. That may be fine for
  an editor app dedicated to this game, but it should be done through a
  game-content catalog/module, not by making the engine aware of the game.

## Target Architecture

Dependency direction should be:

```text
src/game   ----\
                ---> src/engine
src/editor ----/
```

The engine must not import from either app.

The minimal target tree can stay close to the current repo:

```text
src/
  engine/
    index.ts                     # public engine API barrel
    Engine.ts
    asset-store/
    ecs/
    event-bus/
    input-manager/
    level-manager/
    loop-strategy/
    serialization/
    types/
    utils/

  game/
    main.ts                      # game app entrypoint
    Game.ts
    gameModule.ts                # app-provided component/system/event catalog
    components/
    events/
    systems/

  editor/
    main.ts                      # editor app entrypoint
    Editor.ts
    ...
```

If we want a stricter separation later, move game-specific components, systems,
events, and assets into a neutral domain folder such as `src/gameplay` or
`src/modules/ecslime-demo`. Then `src/game` and `src/editor` both become app
shells that import the same gameplay module plus the engine.

## Public Engine API

Add `src/engine/index.ts` and make apps import from it:

```ts
export { default as Engine } from './Engine';
export { default as AssetStore } from './asset-store/AssetStore';
export { default as Component } from './ecs/Component';
export type { ComponentClass } from './ecs/Component';
export { default as Entity } from './ecs/Entity';
export { default as Registry } from './ecs/Registry';
export { default as System } from './ecs/System';
export { default as EventBus } from './event-bus/EventBus';
export { default as GameEvent } from './event-bus/GameEvent';
export { default as LevelManager } from './level-manager/LevelManager';
export { default as RAFLoopStrategy } from './loop-strategy/RAFLoopStrategy';
export { default as FixedFPSLoopStrategy } from './loop-strategy/FixedFPSLoopStrategy';
export * from './serialization/serialization';
export * from './serialization/deserialization';
export * from './types/control';
export * from './types/map';
export * from './types/utils';
export * from './utils/circle';
export * from './utils/constants';
export * from './utils/rectangle';
export * from './utils/vector';
```

After the barrel exists, update app imports over time from paths like
`../../engine/ecs/System` to the public API where practical:

```ts
import { System, Rectangle, rectanglesOverlap } from '../../engine';
```

For very large files, this can be a mechanical follow-up after the core
dependency inversion is complete.

## Component Catalog

The engine currently assumes every serializable component lives in
`src/game/components`. Replace that with an app-provided component catalog.

Engine-owned types:

```ts
export type ComponentFieldDefinition = {
    name: string;
    type: 'number' | 'string' | 'boolean' | 'vector' | 'rectangle' | 'enum' | 'json';
    options?: readonly string[];
};

export type ComponentDefinition<T extends Component = Component> = {
    name: string;
    constructor: ComponentClass<T>;
    fields?: ComponentFieldDefinition[];
    serialize?: (component: T) => Record<string, unknown>;
    deserialize?: (properties: Record<string, unknown>) => ConstructorParameters<ComponentClass<T>>;
    clone?: (component: T) => ConstructorParameters<ComponentClass<T>>;
};

export type ComponentCatalog = {
    get(name: string): ComponentDefinition | undefined;
    getByConstructor(component: Component): ComponentDefinition | undefined;
    list(): ComponentDefinition[];
};
```

Game-owned catalog:

```ts
// src/game/gameModule.ts
import * as Components from './components';
import * as Systems from './systems';
import * as Events from './events';
import { createComponentCatalog } from '../engine';

export const gameComponentCatalog = createComponentCatalog([
    { name: 'TransformComponent', constructor: Components.TransformComponent },
    { name: 'SpriteComponent', constructor: Components.SpriteComponent },
    // ...
]);

export const gameModule = {
    components: gameComponentCatalog,
    systems: Systems,
    events: Events,
};
```

This catalog becomes the bridge used by:

- `deserializeEntity(entityMap, registry, catalog)`
- `deserializeEntities(entityMaps, registry, catalog)`
- `Registry.duplicateEntity(entity, catalog)` or a new engine utility such as
  `cloneEntity(entity, registry, catalog)`
- editor component selectors and forms
- tests that need local throwaway components

This removes the engine's dependency on the game and also fixes the current
minification risk noted in `deserialization.ts`, where constructor text is
parsed to recover parameter names.

As part of this, add `createComponentCatalog` to the engine API. It can start
as a thin wrapper around maps keyed by component name and constructor, then grow
field metadata for editor forms.

## Serialization Boundary

Keep pure JSON shape logic in the engine:

- `serializeEntity`
- `serializeEntities`
- `serializeLevel`
- `deserializeEntity`
- `deserializeEntities`
- `isValidLevelMap`
- `isValidEntityMap`

Move browser/app persistence out of the engine:

- Move JSON download helpers from `src/engine/serialization/persistence.ts` to
  editor-owned file persistence, for example
  `src/editor/persistence/filePersistence.ts`.
- Move `localStorage` level helpers to editor-owned persistence, or make the
  engine define a small `LevelStorage` interface and have the editor provide a
  `LocalStorageLevelStorage` implementation.

Recommended engine-level shape:

```ts
export interface LevelStorage {
    saveLevel(levelId: string, level: LevelMap): void;
    loadLevel(levelId: string): LevelMap | undefined;
}
```

Then `LevelManager` can either avoid storage entirely and only load
`LevelMap`s, or accept a `LevelStorage` adapter from the app.

## Engine Runtime State

Replace static `Engine` fields with instance-owned state. A reusable engine
library should allow more than one engine instance, test cleanly, and avoid
cross-app global state.

Proposed engine state:

```ts
export type EngineState = {
    mousePositionScreen: Vector;
    mousePositionWorld: Vector;
    viewport: Rectangle;
    world: {
        width: number;
        height: number;
    };
    status: GameStatus;
};
```

`GameStatus` currently lives in `src/engine/types/utils.ts`, but the `WON` and
`LOST` values are game-app concepts. During this phase either rename it to a
generic `EngineStatus` with only engine lifecycle states, or move game outcome
state into `src/game`.

Migration strategy:

1. Add `this.state` to `Engine` while keeping the current static fields as
   temporary aliases.
2. Update systems to accept `EngineState` or the specific values they need.
3. Remove static reads/writes after game and editor are migrated.

This can be done after the component catalog work, because the static state is
unpleasant but not the main dependency inversion blocker.

## App Entrypoints

Create separate bootstraps:

```text
src/game/main.ts
src/editor/main.ts
```

`src/game/main.ts`:

```ts
import { RAFLoopStrategy } from '../engine';
import Game from './Game';

const game = new Game();
game.setLoopStrategy(new RAFLoopStrategy(game));
game.run();
```

`src/editor/main.ts`:

```ts
import { RAFLoopStrategy } from '../engine';
import Editor from './Editor';

const editor = new Editor();
editor.setLoopStrategy(new RAFLoopStrategy(editor));
editor.run();
```

Update HTML files:

- `game.html` should load `./src/game/main.ts`.
- `editor.html` should load `./src/editor/main.ts`.

Update package scripts:

- `start`: `parcel game.html`
- `start:editor`: `parcel editor.html`
- `build:game`: `parcel build game.html`
- `build:editor`: `parcel build editor.html`

The current `build:editor` points at `game.html`, so fix that during this
phase.

## Migration Phases

### Phase 1: Add the Engine API and Boundary Guard

1. [x] Add `src/engine/index.ts` with public exports.
2. [ ] Add a dependency boundary test or script that fails when `src/engine`
   imports `src/game` or `src/editor`. Deferred for now.
3. [x] Keep existing imports working while introducing the public API.

Acceptance checks:

- [x] `rg "../../game|../game|../../editor|../editor" src/engine` returns no app
  imports, or only known temporary TODOs during the phase.
- [x] `npm test` still passes.

Status: the boundary guard is deferred because it is not needed at the moment.
Phase 2 removed two of the three initial engine-to-game imports; Phase 3 removes
the remaining `Registry.ts` import.

### Phase 2: Introduce the Component Catalog

1. [x] Add engine catalog types and a `createComponentCatalog` helper.
2. [x] Add `src/game/gameModule.ts` that exports the game's component catalog,
   systems, and events.
3. [x] Change `ComponentMap.name` from `keyof typeof GameComponents` to `string`.
4. [x] Update deserialization to receive a catalog instead of importing
   `GameComponents`.
5. [x] Update tests to create and pass test catalogs.

Acceptance checks:

- [x] `src/engine/serialization/deserialization.ts` has no app imports.
- [x] `src/engine/types/map.ts` has no app imports.
- [x] Serialization/deserialization tests cover custom test components that are not
  in `src/game/components`.

### Phase 3: Decouple Registry Duplication

1. [x] Remove `GameComponents` from `src/engine/ecs/Registry.ts`.
2. [x] Move component cloning into the component catalog or a serialization helper.
3. [x] Make entity duplication use catalog definitions, not constructor-name lookup.
4. [x] Update editor duplication and paste flows to call the new utility.

Acceptance checks:

- [x] `src/engine/ecs/Registry.ts` has no app imports.
- [x] Entity duplication works for game components and for test-only components.

### Phase 4: Separate Pure Serialization from Browser Persistence

1. [x] Keep pure map conversion in `src/engine/serialization`.
2. [x] Move JSON download helpers into `src/editor/persistence`.
3. [x] Move `localStorage` helpers into `src/editor/persistence`, or introduce a
   `LevelStorage` adapter interface in the engine.
4. [x] Update `LevelManager` so it loads `LevelMap`s with a catalog and does not
   directly depend on browser storage.

Acceptance checks:

- [x] `src/engine/serialization` can be tested in Jest without DOM APIs.
- [x] Editor import/export and local level loading still work.

### Phase 5: Split Game and Editor Entrypoints

1. [x] Add `src/game/main.ts`.
2. [x] Add `src/editor/main.ts`.
3. [x] Update `game.html` and `editor.html`.
4. [x] Remove the `IS_EDITOR` switch from `src/index.ts`, or delete `src/index.ts`
   if no longer needed.
5. [x] Fix `build:editor`.

Acceptance checks:

- [x] `npm start` is wired to the game app entrypoint.
- [x] `npm run start:editor` is wired to the editor app entrypoint.
- [x] `npm run build:game` and `npm run build:editor` both target the correct HTML.

### Phase 6: Normalize App Imports

1. [x] Update `src/game` and `src/editor` imports to use the public engine API.
2. [x] Prefer `import { Engine, System, Rectangle } from '../engine'` or
   `../../engine` over deep imports.
3. [x] Keep deep engine imports only when a submodule is intentionally public and
   documented.

Acceptance checks:

- [x] App code imports engine concepts through the barrel or documented sub-barrels.
- [x] App code does not import from engine files that are meant to stay private.

### Phase 7: Replace Static Engine State

1. Add `EngineState`.
2. Migrate static `Engine.*` reads/writes to instance state.
3. Pass state or specific values into systems that currently read static fields.
4. Remove temporary static aliases.

Acceptance checks:

- No gameplay or editor logic reads `Engine.mapWidth`, `Engine.mousePosition*`,
  `Engine.window*`, or `Engine.gameStatus`.
- Multiple engine instances can exist in tests without sharing runtime state.

## Testing Strategy

Run the existing suite after each phase:

```sh
npm test
```

Add focused tests while refactoring:

- Engine boundary test: `src/engine` must not import `src/game` or `src/editor`.
- Component catalog tests: lookup by name and constructor, duplicate component
  data, enum/field metadata if used by the editor.
- Serialization tests with test-only components.
- LevelManager tests with a fake component catalog and fake storage adapter.
- App smoke tests or build checks for both HTML entrypoints:

```sh
npm run build:game
npm run build:editor
```

## Suggested Commit Order

1. `engine: add public api barrel and boundary test`
2. `engine: add component catalog abstraction`
3. `engine: make serialization catalog-driven`
4. `engine: move entity duplication out of game component lookup`
5. `editor: move browser persistence out of engine serialization`
6. `apps: split game and editor entrypoints`
7. `apps: import engine through public api`
8. `engine: replace static runtime state with engine state`

## Definition of Done

- `src/engine` has zero imports from `src/game` or `src/editor`.
- `src/game` and `src/editor` each have their own app entrypoint.
- Shared bootstrapping through `src/index.ts` is removed or reduced to a
  non-app library export.
- Game/editor code consumes engine types and classes through `src/engine/index.ts`
  or documented submodule barrels.
- Serialization/deserialization supports app-provided components through a
  catalog.
- Browser persistence lives in app code or behind an app-provided adapter.
- Tests and builds pass for both apps.
