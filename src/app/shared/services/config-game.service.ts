import * as Phaser from 'phaser';

import { Injectable } from '@angular/core';
import { MainMenuSceneService } from '../scenes/main-menu.scene.service';
import { PauseSceneService } from '../scenes/pause.scene.service';
import { RunningSceneService } from '../scenes/running.scene.service';
import { SettingsSceneService } from '../scenes/settings.scene.service';
import { YouLostSceneService } from '../scenes/you-lost.scene.service';
import { YouWinSceneService } from '../scenes/you-win.scene.service';

@Injectable({
    providedIn: 'root'
})
export class ConfigGameService {

    constructor(
        private _RunningSceneService: RunningSceneService,
        private _pauseSceneService: PauseSceneService,
        private _YouLostSceneService: YouLostSceneService,
        private _YouWinSceneService: YouWinSceneService,
        private _mainMenuSceneService: MainMenuSceneService,
        private _settingsScene: SettingsSceneService
    ) {}

    config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 600,
        height: 600,
        backgroundColor: 'black',
        parent: 'game',
        fps: {
            target: 60,
            forceSetTimeOut: true
        },
        physics: {
            default: 'arcade',
            arcade: {
                debug: false
            }
        },
        scene: [
            this._mainMenuSceneService.scene,
            this._RunningSceneService.scene,
            this._pauseSceneService.scene,
            this._YouLostSceneService.scene,
            this._YouWinSceneService.scene,
            this._settingsScene.scene
        ]
    };
}
