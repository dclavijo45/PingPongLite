import * as Phaser from 'phaser';

import { Observable, Subject } from 'rxjs';

import { IGameSettings } from '../interfaces/settings';
import { Injectable } from '@angular/core';
import { SettngsOptionsScene } from '../interfaces/settings-options-scene';

@Injectable({
    providedIn: 'root'
})
export class SettingsSceneService {
    readonly scene: SettingsScene;

    #dispatchSettingsGame: Subject<IGameSettings>;

    constructor() {
        this.scene =  new SettingsScene({});

        this.#dispatchSettingsGame = new Subject<IGameSettings>();

        this.scene.listenSettings().subscribe(gameSettings=>{
            this.updateSettings(gameSettings);
        });
    }

    private updateSettings(settings: IGameSettings): void {
        this.#dispatchSettingsGame.next(settings);
    }

    listenSettings(): Observable<IGameSettings> {
        return this.#dispatchSettingsGame.asObservable();
    }
}

class SettingsScene extends Phaser.Scene {
    // Texts
    private currentFpsText!: Phaser.GameObjects.Text;
    private returnText!: Phaser.GameObjects.Text;
    private keyboardModeText!: Phaser.GameObjects.Text;
    private networkModeText!: Phaser.GameObjects.Text;
    private musicOnModeText!: Phaser.GameObjects.Text;
    private musicOffModeText!: Phaser.GameObjects.Text;
    private effectsOnModeText!: Phaser.GameObjects.Text;
    private effectsOffModeText!: Phaser.GameObjects.Text;


    // Utils
    #dispatchSettingsGame: Subject<IGameSettings>;
    private gameSettings: IGameSettings;
    private optionsCreate!: SettngsOptionsScene;

    constructor(config: Phaser.Types.Core.GameConfig) {
        super({
            ...config,
            key: 'SettingsScene',
        });

        this.#dispatchSettingsGame = new Subject<IGameSettings>();
        this.gameSettings = {
            gameMode: 0,
            music: true,
            effects: true
        };
    }

    private close(): void {
        switch (this.optionsCreate.scene) {
            case 0:
                this.scene.resume('MainMenuScene');
                this.scene.wake('MainMenuScene');
                this.scene.stop();
                break;

            case 1:
                this.scene.resume('PauseScene');
                this.scene.wake('PauseScene');
                this.scene.stop();
                break;
            default:
                break;
        };
    }

    create(options: SettngsOptionsScene): void {
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.optionsCreate = options;

        // Init texts
        this.initTexts();

        // Init timers
        this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                this.currentFpsText.setText(`${this.game.loop.actualFps.toFixed()} FPS`);
            }
        });

        // Init pointerdown events
        this.InitPointerdownEvents();
    }

    updateSettings(): void {
        this.#dispatchSettingsGame.next(this.gameSettings);
    }

    listenSettings(): Observable<IGameSettings> {
        return this.#dispatchSettingsGame.asObservable();
    }

    private initTexts(): void {
        this.currentFpsText = this.add.text(this.game.config.width as number - 55, 10, '0 FPS', {
            fontSize: '10px',
            color: '#fff'
        });

        this.returnText = this.add.text(110, 278, 'Return', {
            fontSize: '15px',
            color: '#fff'
        }).setInteractive();

        // Game mode
        this.add.text(230, 130, 'Settings', {
            fontSize: '30px',
            color: '#fff'
        });

        this.add.text(200, 278, 'Game mode:', {
            fontSize: '15px',
            color: '#fff'
        });

        if (this.gameSettings.gameMode === 0) {
            this.keyboardModeText = this.add.text(200, 303, '- Keyboard', {
                fontSize: '15px',
                color: '#fff'
            }).setInteractive();
        }else{
            this.keyboardModeText = this.add.text(200, 303, '  Keyboard', {
                fontSize: '15px',
                color: '#fff'
            }).setInteractive();
        };

        if (this.gameSettings.gameMode === 1) {
            this.networkModeText = this.add.text(200, 328, '- Network', {
                fontSize: '15px',
                color: '#fff'
            }).setInteractive();
        }else{
            this.networkModeText = this.add.text(200, 328, '  Network', {
                fontSize: '15px',
                color: '#fff'
            }).setInteractive();
        };

        // Music
        this.add.text(330, 278, 'Music:', {
            fontSize: '15px',
            color: '#fff'
        });

        if (this.gameSettings.music) {
            this.musicOnModeText = this.add.text(330, 302, '- On', {
                fontSize: '15px',
                color: '#fff'
            }).setInteractive();
        }else{
            this.musicOnModeText = this.add.text(330, 302, '  On', {
                fontSize: '15px',
                color: '#fff'
            }).setInteractive();
        };

        if (!this.gameSettings.music) {
            this.musicOffModeText = this.add.text(330, 328, '- Off', {
                fontSize: '15px',
                color: '#fff'
            }).setInteractive();
        }else{
            this.musicOffModeText = this.add.text(330, 328, '  Off', {
                fontSize: '15px',
                color: '#fff'
            }).setInteractive();
        };

        // Effects
        this.add.text(430, 278, 'Effects:', {
            fontSize: '15px',
            color: '#fff'
        }).setInteractive();

        if (this.gameSettings.effects) {
            this.effectsOnModeText = this.add.text(430, 302, '- On', {
                fontSize: '15px',
                color: '#fff'
            }).setInteractive();
        }else{
            this.effectsOnModeText = this.add.text(430, 302, '  On', {
                fontSize: '15px',
                color: '#fff'
            }).setInteractive();
        };

        if (!this.gameSettings.effects) {
            this.effectsOffModeText = this.add.text(430, 328, '- Off', {
                fontSize: '15px',
                color: '#fff'
            }).setInteractive();
        }else{
            this.effectsOffModeText = this.add.text(430, 328, '  Off', {
                fontSize: '15px',
                color: '#fff'
            }).setInteractive();
        }
    }

    private InitPointerdownEvents(): void {
        this.returnText.on('pointerdown', () => {
            this.close();
        });

        // Game mode
        this.keyboardModeText.on('pointerdown', () => {
            this.gameSettings.gameMode = 0;
            this.keyboardModeText.setText('- Keyboard');
            this.networkModeText.setText('  Network');
            this.updateSettings();
        });

        this.networkModeText.on('pointerdown', () => {
            this.gameSettings.gameMode = 1;
            this.keyboardModeText.setText('  Keyboard');
            this.networkModeText.setText('- Network');
            this.updateSettings();
        });

        // Music
        this.musicOffModeText.on('pointerdown', () => {
            this.gameSettings.music = false;
            this.musicOnModeText.setText('  On');
            this.musicOffModeText.setText('- Off');
            this.updateSettings();
        });

        this.musicOnModeText.on('pointerdown', () => {
            this.gameSettings.music = true;
            this.musicOnModeText.setText('- On');
            this.musicOffModeText.setText('  Off');
            this.updateSettings();
        });

        // Effects
        this.effectsOffModeText.on('pointerdown', () => {
            this.gameSettings.effects = false;
            this.effectsOnModeText.setText('  On');
            this.effectsOffModeText.setText('- Off');
            this.updateSettings();
        });

        this.effectsOnModeText.on('pointerdown', () => {
            this.gameSettings.effects = true;
            this.effectsOnModeText.setText('- On');
            this.effectsOffModeText.setText('  Off');
            this.updateSettings();
        });
    }
}
