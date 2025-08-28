# Blob Slash

A JavaScript game engine for the browser. Built around an "Entity Component System (ECS)" architecture.

This project expands on the initial version of the [JS 2D ECS Game Engine](https://github.com/samdalvai/js-2d-ecs-game-engine) by introducing:

- An **editor mode** for designing and managing game levels.
- Additional **game systems and mechanics**.

# Getting Started

## Prerequisites

- Node.js installed on your machine.

## Install dependencies

```
npm install
```

## Run in game mode

```
npm start
```

Now open the browser at http://localhost:1234

## Run in editor mode

```
npm run start:editor
```

## Clean build files

If you switch between game mode and editor mode, you may need to clean the build files:

```
npm run clean
```

# Editor Features

![Game editor](images/editor.png)

The editor provides tools to design and manage entities, components, and levels:

- Entity management

    - Entity creation
    - Adding/Editing/Removing components to entities
    - Editing entities tags and groups

- Map editing

    - Move entities in the map (optionally snapping to a grid layout)
    - Copy/Cut/Paste entities
    - Undo/Redo changes

- Import / Export

    - Export/Import entities to/from json files
    - Import/Export levels to/from json files

- Other Utilities
    - Test out game systems
    - Load entity sprites
    - Persist levels in the browser local storage

# Game example

A demonstration RPG-style 2D game built with this engine where the player can cast some spells and kill enemies.

![Game example](images/game.png)

# Project structure

```text
/src

    /__tests__
        /editor             -> Unit tests for editor related logic
        /engine             -> Unit tests for engine related logic
        / game              -> Unit tests for game related logic

    /editor
        /entity-editor      -> Level and entity management with Html elements logic
        /events             -> Editor events (entiy delete, entity paste, etc.)
        /gui                -> Html gui utilities
        /persistence        -> Handling of levels storage and loading
        /systems            -> Editor systems (entity drag, sidebar rendering, etc.)
        /types              -> Editor related types
        /version-manager    -> Handling of undo/redo and level versions

    /engine
        /asset-store        -> Handling of asset loading and retrieval (sprites, sounds, etc.)
        /config             -> Configuration for assets loading in Javascript modules
        /ecs                -> Logic for entity/components/systems architecture
        /event-bus          -> Handling of game events
        /input-manager      -> Handling of game inputs (mouse, keyboard)
        /level-manager      -> Loading and initialization of levels
        /loop-strategy      -> Definition of engine loop logic (fixed or default)
        /serialization      -> Serialization and deserialization of levels and entities to/from json
        /types              -> Core engine types
        /utils              -> Engine utility and Math related functions

    /game
        /components         -> Entities components (sprite, transform, health, etc.)
        /events             -> Game events (collision, hit, etc.)
        /systems            -> Game systems (movement, rendering, collision, etc.)

```
