# Standard-coordinate migration plan

## Goal

Make the engine, editor, game, renderer, input handling, and saved levels use one
world-coordinate convention:

- X increases to the right.
- Y increases upward.
- The map occupies `0 <= x <= mapWidth` and `0 <= y <= mapHeight`; `(0, 0)` is
  the map's bottom-left corner.
- `TransformComponent.position` is the **centre** of an entity's visual bounds.
- World-space positions, directions, velocities, offsets, destinations, collider
  centres, and rotations use this convention. Canvas/screen coordinates are used
  only at rendering and DOM-input boundaries.
- Existing world distances remain pixel units. No unit conversion or physics
  engine work is part of this migration.

This is intentionally a coordinate-system and entity-origin migration only. It
must not add, connect, or otherwise plan the later physics integration.

## Target model and invariants

### Transform, sprite, and bounds

`TransformComponent.position` is the sprite centre. For a sprite with scaled
width `w` and scaled height `h`, its world bounds are:

```ts
left   = position.x - w / 2;
right  = position.x + w / 2;
bottom = position.y - h / 2;
top    = position.y + h / 2;
```

`BoxColliderComponent.offset` becomes an unscaled local offset from the
transform centre to the collider centre. Its `width` and `height` stay full
extents, and transform scale applies to both its extents and offset. Put shared
`getSpriteBounds()` and `getColliderBounds()` helpers in the engine so no system
reconstructs these bounds ad hoc.

Positive rotation is counter-clockwise in world space. Keep the current public
degree representation for this migration if avoiding an unrelated API/data
change is valuable, but explicitly name it `rotationDegrees` or document it
unambiguously. Do not mix the old canvas-clockwise meaning with the new world
meaning.

### Camera and conversion boundary

Replace `Rectangle`-as-camera with a dedicated world camera type, for example:

```ts
type Camera = {
  center: Vector;
  viewportWidth: number;
  viewportHeight: number;
};
```

Provide derived `left`, `right`, `bottom`, and `top` values. At zoom `z`, the
only supported conversion functions are:

```ts
worldToScreen(world, camera, z) => {
  x: (world.x - camera.left) * z,
  y: (camera.top - world.y) * z,
};

screenToWorld(screen, camera, z) => {
  x: screen.x / z + camera.left,
  y: camera.top - screen.y / z,
};
```

UI remains in normal canvas coordinates with `(0, 0)` at the screen top-left.
The world-render pass applies the equivalent canvas transform, then restores it
before rendering UI, menus, and DOM-oriented debug information.

### Save-file versioning

Add `coordinateSystemVersion` to `LevelMap`; new maps use `2`. Treat maps
without it as legacy version `1`. Loading a version-1 map must convert it in
memory before entity creation, while saving always writes version `2`. Include a
one-time migration utility to rewrite checked-in level JSON files only after the
in-memory conversion has been verified.

## Implementation phases

### 1. Establish the contract and safety net

1. Add the coordinate-system contract above to engine-facing documentation and
   type comments for `TransformComponent`, `BoxColliderComponent`, camera, and
   `Engine.mousePositionWorld`.
2. Inventory every world-coordinate field and every field whose Y direction is
   meaningful. Start from `TransformComponent`, `RigidBodyComponent`,
   `BoxColliderComponent`, `EntityDestinationComponent`, `ParticleEmitComponent`,
   `ShadowComponent`, `HighlightComponent`, `TextLabelComponent`, light/effect
   components, and any script-defined coordinates.
3. Add focused unit tests for the new conversion and bounds helpers before
   replacing existing coordinate arithmetic. Test all four viewport corners,
   zoom values, camera offsets, centre anchors, and exact screen/world round
   trips.
4. Add test fixtures for a representative persisted level and for a level that
   contains scaled sprites, colliders, destinations, particles, labels, and
   fixed/UI entities.

**Exit criteria:** the target convention is documented; tests describe its
mathematics; every coordinate-bearing component has an owner and migration rule.

### 2. Build the shared coordinate and bounds API

1. Introduce `Camera`, `worldToScreen`, `screenToWorld`, camera viewport-bound
   helpers, sprite-bound helpers, collider-bound helpers, and rectangle/AABB
   overlap helpers in `src/engine`.
2. Give camera clamping explicit world bounds: clamp `center.x` against
   `[viewportWidth / 2, mapWidth - viewportWidth / 2]` and `center.y` against
   `[viewportHeight / 2, mapHeight - viewportHeight / 2]`; centre it when the
   map is smaller than a viewport dimension.
3. Add a render-pass helper that saves the canvas, sets the world transform, and
   restores it. It should implement the conversion contract rather than make
   each renderer subtract a camera position manually.
4. Keep the helpers temporarily unused by gameplay systems except in dedicated
   tests. This makes the new coordinate API independently reviewable.

**Exit criteria:** no new code performs manual `camera.y +/- screenY` conversion
or manually builds sprite/collider AABBs.

### 3. Migrate rendering and input boundaries

1. Render game-world systems inside the new world pass: sprites, particles,
   lights, shadows, highlights, health bars, labels, cursor world indicators,
   and every debug-world renderer.
2. Render GUI, cursor/UI chrome, menu, and screen-space debug text after the
   world pass has restored the default canvas transform.
3. Draw bitmaps upright in the Y-flipped world transform by applying a local
   vertical flip before `drawImage`. Preserve horizontal/vertical sprite flip
   behaviour and verify combined flip plus rotation cases.
4. Convert DOM mouse input once with `screenToWorld`, including canvas/sidebar
   offsets and editor zoom. Emit only world coordinates in mouse events.
5. Make camera following operate on a transform centre. Update culling to use
   `left/right/top/bottom` bounds, not a top-left rectangle.
6. Reverse same-layer sprite depth ordering if necessary: in a Y-up top-down
   game, render higher-Y entities first and lower-Y entities later so lower
   entities appear in front. Make this a named depth-order policy and test it.

**Exit criteria:** renderers no longer contain `position.y - camera.y` or
`screenY + camera.y`; all game-world visuals, pointer picking, and UI render in
the expected coordinate spaces.

### 4. Migrate gameplay and collision semantics

1. Change `TransformComponent` construction sites so created entities specify
   their centre rather than their prior top-left corner. Replace all
   `sprite.width / 2` and `sprite.height / 2` compensations that only existed to
   find a centre.
2. Convert AABB collision code to collider centre + half-extents. Keep its
   current collision behaviour; only the coordinate representation changes.
3. Update collision normal comments and movement resolution to state Y-up
   semantics: `normal.y > 0` is upward and `normal.y < 0` is downward. Verify
   position correction, direction updates, and animations against those signs.
4. Update map containment, player padding, culling, entity-following,
   detection, attacks, projectiles, teleportation, destination movement,
   damage/effect radii, particles, and scripting to use centre/bounds helpers.
5. Convert all local vertical offsets: old positive-down visual offsets become
   positive-up offsets. Audit shadows, highlights, text labels, light centres,
   particles, and debug indicators explicitly rather than applying a blanket
   negation.
6. Update fixed entities so they are unambiguously screen-space. Their
   transforms must not accidentally be interpreted as world centres.

**Exit criteria:** a player can move, click-to-move, attack, collide, follow,
teleport, spawn effects/projectiles, and leave map bounds with identical visual
behaviour to before the migration.

### 5. Migrate the editor

1. Move editor camera state and panning to the shared `Camera` API. With
   screen-space drag deltas `dx` and `dy`, the camera centre changes by
   `(-dx / zoom, +dy / zoom)` when dragging the world with the pointer.
2. Render the grid, game border, sprites, invisible entities, selection boxes,
   collider overlays, and debug overlays in the world pass. Derive grid line
   ranges from camera bounds.
3. Convert editor pointer events, selection hit tests, marquee selection,
   dragging, snapping, copy/paste placement, and zoom-about-pointer to shared
   `screenToWorld`/`worldToScreen` helpers.
4. Update sidebar position fields and labels to describe centre coordinates and
   Y-up values. Ensure entity duplication, drag previews, and inspector edits
   retain the new anchor.
5. Exercise test mode through the same coordinate boundary as the game; it must
   not contain a second coordinate implementation.

**Exit criteria:** grid, border, selection, drag, snap, pan, zoom, inspector
editing, copy/paste, and test mode agree exactly with the game world.

### 6. Convert persisted levels safely

1. Implement a version-1-to-version-2 level conversion before deserialization.
   For a legacy sprite transform with old top-left position `(oldX, oldY)` and
   scaled sprite size `(w, h)`, write:

   ```ts
   newX = oldX + w / 2;
   newY = mapHeight - (oldY + h / 2);
   ```

2. Convert every coordinate-bearing component according to the inventory from
   phase 1. In particular, transform collider offsets from old top-left,
   positive-down values to centre-relative, positive-up values; convert
   destinations and absolute positions with the same map-height inversion; and
   invert local Y offsets where their semantic direction is vertical.
3. Preserve raw asset dimensions and scale. Do not mutate map dimensions.
4. Make conversion idempotent: a version-2 level is never transformed again.
   Reject unknown future versions with a clear error.
5. Add serialization/deserialization tests proving that legacy input loads to
   the expected v2 in-memory model and that a v2 save/load round trip is stable.
6. After passing those tests and visually checking representative levels, run a
   controlled one-time conversion of checked-in level files and set their
   version to `2`. Keep backward reading support unless a separately approved
   breaking-change policy removes it.

**Exit criteria:** old levels open visually unchanged, new levels save as v2,
and no level is inverted, shifted by half a sprite, or converted twice.

### 7. Verify, remove compatibility code, and document

1. Run the complete unit test suite plus new tests for camera, conversion,
   collider bounds, collision normals, level migration, and editor operations.
2. Perform visual smoke tests at multiple resolutions and zoom levels: map
   corners, camera edges, click targets, rotated/flipped sprites, lights,
   shadows, labels, particles, selection boxes, and fixed UI.
3. Search for legacy patterns such as `position.y - camera.y`,
   `inputEvent.y + camera.y`, and top-left collider arithmetic. Replace every
   legitimate case with a named helper; document intentional screen-space cases.
4. Remove v1-only runtime branches only when the project no longer needs to
   load legacy files, in a separate explicit compatibility decision.
5. Update contributor/editor documentation with the coordinate contract,
   camera API, centre-anchor rule, and level format version.

## Suggested delivery slices

Keep pull requests small and independently runnable:

1. Coordinate/camera/bounds helpers with tests.
2. Game render pass and game input conversion.
3. Gameplay transform and collision migration.
4. Editor conversion.
5. Level-versioning, migration utility, and converted fixtures.
6. Cleanup, regression tests, and documentation.

Do not start the later physics-engine integration in any of these slices. Its
only prerequisite delivered here is a coherent Y-up, centre-anchored world
model.
