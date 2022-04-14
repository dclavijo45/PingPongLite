import * as Phaser from 'phaser';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { IGameSettings } from '../interfaces/settings';
import { Injectable } from '@angular/core';
import { SettingsSceneService } from './settings.scene.service';

@Injectable({
    providedIn: 'root'
})
export class MainMenuSceneService {
    readonly scene: MainMenuScene;

    constructor(
        private _settingsSceneService: SettingsSceneService
    ) {
        this.scene =  new MainMenuScene({});

        this._settingsSceneService.listenSettings().subscribe(gameSettings=>{
            this.scene.updateSettings(gameSettings);
        })
    }
}

class MainMenuScene extends Phaser.Scene {
    // Texts
    private currentFpsText!: Phaser.GameObjects.Text;

    // Keyboard events

    // Sounds
    private backgroundSound!: Phaser.Sound.BaseSound;

    // Sprites
    private settingsSprite!: Phaser.Physics.Arcade.Sprite;
    private playSprite!: Phaser.Physics.Arcade.Sprite;

    // Utils
    #dispatchSettings: BehaviorSubject<IGameSettings>;

    private subscriptionSettings!: Subscription;
    private gameSettings!: IGameSettings;

    constructor(config: Phaser.Types.Core.GameConfig) {
        super({
            ...config,
            key: 'MainMenuScene',
        });

        this.#dispatchSettings = new BehaviorSubject<IGameSettings>({
            gameMode: 0,
            music: true,
            effects: true
        });
    }

    private listenUpdateSettings(): Observable<IGameSettings> {
        return this.#dispatchSettings.asObservable();
    }

    private stopScene(): void {
        if (this.backgroundSound.isPaused || this.backgroundSound.isPlaying) {
            this.backgroundSound.destroy();
        };

        this.subscriptionSettings.unsubscribe();
        this.scene.stop();
    }

    preload(){
        this.load.image('settingsImage', 'assets/images/settings.png');
        this.load.image('playImage', 'assets/images/play.png');

        this.load.audio('backgroundSound', 'assets/sounds/background.mp3');
    }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // Init sprites
        this.settingsSprite = this.physics.add.sprite((this.game.config.width as number / 2) + 120, (this.game.config.height as number / 2) - 50, 'settingsImage').setInteractive();
        this.settingsSprite.displayWidth = 50;
        this.settingsSprite.displayHeight = 50;

        this.playSprite = this.physics.add.sprite((this.game.config.width as number / 2) - 100, (this.game.config.height as number / 2) - 50, 'playImage').setInteractive();
        this.playSprite.displayWidth = 50;
        this.playSprite.displayHeight = 50;

        // Init texts
        this.currentFpsText = this.add.text(this.game.config.width as number - 55, 10, '0 FPS', {
            fontSize: '13px',
            color: '#fff'
        });

        this.add.text(160, 130, 'Ping pong lite :)', {
            fontSize: '30px',
            color: '#fff'
        });

        this.add.text((this.game.config.width as number / 2) + 85, (this.game.config.height as number / 2) - 17, 'Settings', {
            fontSize: '15px',
            color: '#fff'
        });

        this.add.text((this.game.config.width as number / 2) - 120, (this.game.config.height as number / 2) - 17, 'Play', {
            fontSize: '15px',
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

        // Init keyboard events
        this.subscriptionSettings = this.listenUpdateSettings().subscribe((gameSettings)=>{
            this.gameSettings = gameSettings;

            // Init sounds
            if (this.sound.get('backgroundSound')) {
                this.backgroundSound = this.sound.get('backgroundSound');
            }else{
                this.backgroundSound = this.sound.add('backgroundSound', {
                    volume: 0.5,
                    loop: true
                });
            };

            if (gameSettings.music) {
                if (this.backgroundSound.isPaused) {
                    this.backgroundSound.resume();
                }else{
                    if (!this.backgroundSound.isPlaying) {
                        this.backgroundSound.play();
                    };
                };
            }else{
                if (this.backgroundSound.isPlaying) {
                    this.backgroundSound.pause();
                };
            };
        });

        // Init pointerdown events
        this.settingsSprite.on('pointerdown', () => {
            this.scene.pause();
            this.scene.sleep();
            this.scene.launch('SettingsScene', {
                scene: 0
            });
        });

        this.playSprite.on('pointerdown', () => {
            if (this.gameSettings.gameMode == 0) {
                this.stopScene();
                this.scene.launch('RunningScene');
            }else{
                console.log("Game mode is network");
            };
        });

        // Init event resume
        this.events.on('resume',  ()=> {
            this.cameras.main.fadeIn(1000, 0, 0, 0);
        });

        console.log("Main menu scene created");
    }

    updateSettings(gameSettings: IGameSettings): void {
        this.#dispatchSettings.next(gameSettings);
    }
}
