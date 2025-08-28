# Blob Slash

A JavaScript game engine for the browser. Built around an Entity Component System (ECS) architecture.

This project expands on the [JS 2D ECS Game Engine](https://github.com/samdalvai/js-2d-ecs-game-engine) by introducing:

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

## Run in editor mode

```
npm run start:editor
```

## Clean build files

You may need to clean the build files when switching between game mode and editor mode:

```
npm run clean
```

# Editor Features

![Game editor](images/editor.png)

The editor provides tools to design and manage entities, components, and levels:

- Entity management

    - Entity creation
    - Adding, editing, or removing components on entities
    - Editing entities' tags and groups

- Map editing

    - Move entities on the map (with optional grid snapping)
    - Copy/Cut/Paste entities
    - Undo/Redo changes

- Import / Export

    - Export/Import entities to/from json files
    - Import/Export levels to/from json files

- Other Utilities
    - Test game systems
    - Load entity sprites
    - Save levels to the browser's local storage

# Game example

A demonstration RPG-style 2D game built with this engine, where the player can cast spells and defeat enemies.

![Game example](images/game.png)

# Project structure

```text
/src

    /__tests__
        /editor             -> Unit tests for editor related logic
        /engine             -> Unit tests for engine related logic
        /game               -> Unit tests for game related logic

    /editor
        /entity-editor      -> Level and entity management with HTML elements logic
        /events             -> Editor events (entity delete, entity paste, etc.)
        /gui                -> HTML gui utilities
        /persistence        -> Handling of levels storage and loading
        /systems            -> Editor systems (entity drag, sidebar rendering, etc.)
        /types              -> Editor related types
        /version-manager    -> Handling of undo/redo and level versions

    /engine
        /asset-store        -> Asset loading and retrieval (sprites, sounds, etc.)
        /config             -> Configuration for assets loading in Javascript modules
        /ecs                -> Logic for entity/components/systems architecture
        /event-bus          -> Handling of game events
        /input-manager      -> Handling of game inputs (mouse, keyboard)
        /level-manager      -> Loading and initialization of levels
        /loop-strategy      -> Definition of engine loop logic (fixed or default)
        /serialization      -> Serialization and deserialization of levels and entities to/from json
        /types              -> Core engine types
        /utils              -> Engine utility and math-related functions

    /game
        /components         -> Entities components (sprite, transform, health, etc.)
        /events             -> Game events (collision, hit, etc.)
        /systems            -> Game systems (movement, rendering, collision, etc.)

```

# How to develop your game

...

# License

This project is licensed under the [MIT License](LICENSE).
