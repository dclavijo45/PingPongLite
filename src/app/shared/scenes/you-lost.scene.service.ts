import { Injectable } from '@angular/core';
import * as Phaser from 'phaser';

@Injectable({
    providedIn: 'root'
})
export class YouLostSceneService {
    readonly scene: YouLostScene;

    constructor() {
        this.scene =  new YouLostScene({});
    }
}

class YouLostScene extends Phaser.Scene {
    // Keyboard events
    private EnterKeyBoard!: Phaser.Input.Keyboard.Key;

    constructor(config: Phaser.Types.Core.GameConfig) {
        super({
            ...config,
            key: 'YouLostScene',
        });
    }

    create() {
        this.add.text(193, 278, 'YOU LOST', {
            fontSize: '50px',
            color: '#fff'
        })

        this.EnterKeyBoard = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    override update(time: number, delta: number): void {
        if (Phaser.Input.Keyboard.JustDown(this.EnterKeyBoard)) {
                this.scene.resume('RunningScene');
                this.scene.stop();
        };
    }
}
