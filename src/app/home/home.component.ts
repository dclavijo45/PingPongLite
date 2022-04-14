import { Component, OnInit } from '@angular/core';
import { GameService } from '../shared/services/game.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    constructor(private _gameService: GameService) { }

    ngOnInit(): void {
        this._gameService.createGame();
    }

}
