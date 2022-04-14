import * as Phaser from 'phaser';

export interface Player {
    id: number,
    name: string,
    score: number,
    sprite: Phaser.Physics.Arcade.Sprite
}
