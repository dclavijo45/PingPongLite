import { Injectable } from '@angular/core';
import * as Phaser from 'phaser';
import { Observable, Subject } from 'rxjs';
import { RunningSceneService } from './running.scene.service';

@Injectable({
    providedIn: 'root'
})
export class PauseSceneService {
    readonly scene: PauseScene;

    constructor(private _runningSceneService: RunningSceneService) {
        this.scene =  new PauseScene({});

        this.scene.listenOnStop.subscribe(() => {
            this._runningSceneService.stopScene();
        });
    }
}

class PauseScene extends Phaser.Scene {
    // sprites
    private settingsSprite!: Phaser.Physics.Arcade.Sprite;
    private returnSprite!: Phaser.Physics.Arcade.Sprite;

    // Texts
    private currentFpsText!: Phaser.GameObjects.Text;
    private pauseText!: Phaser.GameObjects.Text;

    // Keyboard events
    private EnterKeyBoard!: Phaser.Input.Keyboard.Key;

    #dispatchOnStop: Subject<void>;

    listenOnStop: Observable<void>;

    private updateStop() {
        this.#dispatchOnStop.next();
    }

    constructor(config: Phaser.Types.Core.GameConfig) {
        super({
            ...config,
            key: 'PauseScene',
        });

        this.#dispatchOnStop = new Subject<void>();
        this.listenOnStop = this.#dispatchOnStop.asObservable();
    }

    preload(){
        this.load.image('returnImage', 'assets/images/return.png');
    }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.settingsSprite = this.physics.add.sprite((this.game.config.width as number / 2) + 70, (this.game.config.height as number / 2) - 30, 'settingsImage').setInteractive();
        this.settingsSprite.displayWidth = 50;
        this.settingsSprite.displayHeight = 50;

        this.returnSprite = this.physics.add.sprite((this.game.config.width as number / 2) - 50, (this.game.config.height as number / 2) - 30, 'returnImage').setInteractive();
        this.returnSprite.displayWidth = 50;
        this.returnSprite.displayHeight = 50;

        // Init texts
        this.currentFpsText = this.add.text(this.game.config.width as number - 50, 10, '0 FPS', {
            fontSize: '10px',
            color: '#fff'
        });

        this.add.text((this.game.config.width as number / 2) + 35, (this.game.config.height as number / 2), 'Settings', {
            fontSize: '15px',
            color: '#fff'
        });

        this.add.text((this.game.config.width as number / 2) - 100, (this.game.config.height as number / 2), 'Exit to main', {
            fontSize: '15px',
            color: '#fff'
        });

        this.pauseText = this.add.text(225, 180, 'PAUSE', {
            fontSize: '50px',
            color: '#fff'
        });

        this.add.text(210, 330, '(Press enter to resume)', {
            fontSize: '14px',
            color: '#fff'
        });

        // Init timers
        this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                this.currentFpsText.setText(`${this.game.loop.actualFps.toFixed()} FPS`);
            }
        });

        // Keyboard events
        this.EnterKeyBoard = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        // Pointerdown events
        this.settingsSprite.on('pointerdown', () => {
            this.scene.pause();
            this.scene.sleep();
            this.scene.launch('SettingsScene', {
                scene: 1
            });
        });

        this.returnSprite.on('pointerdown', () => {
            this.updateStop();
            this.scene.stop();
        });

        // Init event resume
        this.events.on('resume',  ()=> {
            this.cameras.main.fadeIn(1000, 0, 0, 0);
        });
    }

    override update(): void {
        if (Phaser.Input.Keyboard.JustDown(this.EnterKeyBoard)) {
            this.scene.resume('RunningScene');
            this.scene.wake('RunningScene');
            this.scene.stop();
        };
    }
}
