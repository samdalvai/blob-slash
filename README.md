# Blob Slash

A JavaScript game engine for the browser. Built around an "Entity Component System (ECS)" architecture.
This project expands on the initial version of this [engine](https://github.com/samdalvai/js-2d-ecs-game-engine) by adding an editor mode and additional game systems and mechanics.

# How to run

## Prerequisites

- Node.js installed

## Install dependencies

```
npm install
```

## Run

```
npm start
```

Now open the browser at http://localhost:1234

## Run in editor mode

```
npm run start:editor
```

## Clean build files

Note: you might need to clean the build files if you go from game mode to editor mode or viceversa.

```
npm run clean
```

# Editor functionalities

![Game editor](images/editor.png)

Currently supported functionalities:

* Entity creation 
* Adding/Editing/Removing components to entities
* Editing entities tags and groups
* Move entities in the map (optionally snapping to a grid layout)
* Copy/Cut/Paste entities
* Export/Import entities to/from json files
* Import/Export levels to/from json files
* Test out game systems
* Load entities sprites
* Persist levels in the browser local storage

# Game example

A demonstration game built with this engine. The game is an rpg style 2d game where a player can cast some spells and kill enemies. 

![Game example](images/game.png)