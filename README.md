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
