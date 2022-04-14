import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfigGameService } from './config-game.service';

@Injectable({
    providedIn: 'root'
})
export class GameService {
    game!: Phaser.Game;

    constructor(private _configGameService: ConfigGameService) {
    }

    createGame(): void {
        this.game = new Phaser.Game(this.config);
    }

    private get config(): Phaser.Types.Core.GameConfig {
        return this._configGameService.config;
    }

    #dispatchCurrentFps: Subject<string> = new Subject();

    onGetCurrentFps(): Observable<string> {
        return this.#dispatchCurrentFps.asObservable();
    }

}
