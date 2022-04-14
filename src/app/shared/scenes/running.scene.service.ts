import { Injectable } from '@angular/core';
import * as Phaser from 'phaser';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { Player } from '../interfaces/player';
import { IGameSettings } from '../interfaces/settings';
import { SettingsSceneService } from './settings.scene.service';

@Injectable({
    providedIn: 'root'
})
export class RunningSceneService {
    readonly scene: RunningScene;
    #dispatchOnStop: Subject<void>;

    constructor(
        private _SettingsSceneService: SettingsSceneService
    ) {
        this.scene =  new RunningScene({});
        this.#dispatchOnStop = new Subject<void>();

        this._SettingsSceneService.listenSettings().subscribe(gameSettings=>{
            this.scene.updateSettings(gameSettings);
        });

        this.listenOnStop().subscribe(() => {
            this.scene.stopScene();
        })
    }

    private listenOnStop(): Observable<void> {
        return this.#dispatchOnStop.asObservable();
    }

    stopScene(): void {
        this.#dispatchOnStop.next();
    }
}

class RunningScene extends Phaser.Scene {
    // Texts
    private currentFpsText!: Phaser.GameObjects.Text;
    private counterRunGame!: Phaser.GameObjects.Text;

    // Keyboard events
    private upKeyBoard!: Phaser.Input.Keyboard.Key;
    private downKeyBoard!: Phaser.Input.Keyboard.Key;
    private WKeyBoard!: Phaser.Input.Keyboard.Key;
    private SKeyBoard!: Phaser.Input.Keyboard.Key;
    private EnterKeyBoard!: Phaser.Input.Keyboard.Key;

    // Sprites
    private barSprite!: Phaser.Physics.Arcade.Sprite;
    private ballSprite!: Phaser.Physics.Arcade.Sprite;
    private playersSprite!: Phaser.Physics.Arcade.Group;

    // Sounds
    private collitionSound!: Phaser.Sound.BaseSound;
    private bgRunningSound!: Phaser.Sound.BaseSound;

    // Objects sprite
    listPlayers: Player[];

    // Utils
    private pausedGame: boolean;
    private endGame: boolean;

    #dispatchSettings: BehaviorSubject<IGameSettings>;
    private subscriptionSettings!: Subscription;

    private gameSettings!: IGameSettings;

    constructor(config: Phaser.Types.Core.GameConfig) {
        super({
            ...config,
            key: 'RunningScene',
        });

        this.listPlayers = [];
        this.pausedGame = false;
        this.endGame = false;

        this.#dispatchSettings = new BehaviorSubject<IGameSettings>({
            gameMode: 0,
            music: true,
            effects: true
        });
    }

    private listenUpdateSettings(): Observable<IGameSettings> {
        return this.#dispatchSettings.asObservable();
    }

    preload(){
        this.load.image('bar_dotted', 'assets/images/bar_dotted.png');
        this.load.image('players', 'assets/images/player.png');
        this.load.image('ball', 'assets/images/ball.png');

        this.load.audio('collitionSound', 'assets/sounds/collition.wav');
        this.load.audio('bgRunningSound', 'assets/sounds/background_running.mp3');
    }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // Init sprites
        this.barSprite = this.physics.add.sprite(this.game.config.width as number / 2, this.game.config.height as number / 2, 'bar_dotted');

        this.ballSprite = this.physics.add.sprite(this.game.config.width as number / 2, (this.game.config.height as number / 2) + 5, 'ball');
        this.ballSprite.setBounce(1);
        this.ballSprite.setCollideWorldBounds(true);

        this.playersSprite = this.physics.add.group({
            defaultKey: 'players',
            maxSize: 2,
        });

        // Init sounds
        this.collitionSound = this.sound.add('collitionSound');
        this.bgRunningSound = this.sound.add('bgRunningSound', {
            volume: 0.3,
            loop: true
        });

        // Init texts
        this.currentFpsText = this.add.text(this.game.config.width as number - 50, 10, '0 FPS', {
            fontSize: '10px',
            color: '#fff'
        });

        this.counterRunGame = this.add.text((this.game.config.width as number / 2) - 8, (this.game.config.height as number / 2) - 8, '3', {
            fontSize: '25px',
            color: '#000'
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
        this.upKeyBoard = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.downKeyBoard = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.WKeyBoard = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.SKeyBoard = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.EnterKeyBoard = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        // Init players

        const player1: Phaser.Physics.Arcade.Sprite = this.playersSprite.get();
        player1.setCollideWorldBounds(true);
        player1.y = this.game.config.height as number / 2;

        player1.x = 580;

        this.listPlayers.push({
            id: 1,
            name: 'Player 1',
            score: 0,
            sprite: player1
        });

        const player2 = this.playersSprite.get();
        player2.setCollideWorldBounds(true);
        player2.y = this.game.config.height as number / 2;
        player2.x = 20;

        this.listPlayers.push({
            id: 2,
            name: 'Player 2',
            score: 0,
            sprite: player2
        });


        // Add event collider for ball
        this.physics.add.collider(this.listPlayers[0].sprite, this.ballSprite, ()=>{
            console.log("COLLISION PLAYER 1");
            this.ballSprite.setVelocityY(Phaser.Math.Between(-100, 600));
            this.ballSprite.setVelocityX(250);

            if (this.gameSettings.effects) {
                this.collitionSound.play();
            };
        });

        this.physics.add.collider(this.listPlayers[1].sprite, this.ballSprite, ()=>{
            console.log("COLLISION PLAYER 2");
            this.ballSprite.setVelocityY(Phaser.Math.Between(-100, 600));
            this.ballSprite.setVelocityX(-250);

            if (this.gameSettings.effects) {
                this.collitionSound.play();
            };
        });

        // Init listen settings changes
        this.subscriptionSettings = this.listenUpdateSettings().subscribe((gameSettings)=>{
            console.log("Response settings sub from running scene");
            this.gameSettings = gameSettings;

            if (gameSettings.music) {
                if (this.bgRunningSound.isPaused) {
                    this.bgRunningSound.resume();
                }else{
                    if (!this.bgRunningSound.isPlaying) {
                        this.bgRunningSound.play();
                    };
                };
            }else{
                if (this.bgRunningSound.isPlaying) {
                    this.bgRunningSound.pause();
                };
            };
        });

        this.events.on('resume',  ()=> {
            if (this.pausedGame) {
                this.pausedGame = false;
                console.log('Scene main resumed from pause');
            }else{
                if (this.endGame) {
                    console.log("EVENT WIN-LOST");
                    this.counterRunGame.setText('3');
                    this.counterRunGame.setVisible(true);
                    this.initGame();
                    this.endGame = false;
                };
            };
        });

        this.initGame();
        console.log("Running scene created");
    }

    override update(time: number, delta: number): void {
        // Reset velocity players
        if (this.listPlayers[0].sprite.active) {
            this.listPlayers[0].sprite.setVelocityY(0);
            this.listPlayers[0].sprite.setVelocityX(0);
        };

        if (this.listPlayers[1].sprite.active) {
            this.listPlayers[1].sprite.setVelocityY(0);
            this.listPlayers[1].sprite.setVelocityX(0);
        };

        // Listen keyboard events:

        // Player 1
        if (this.upKeyBoard.isDown) {
            this.listPlayers[1].sprite.setVelocityY(-600);
        };

        if (this.downKeyBoard.isDown) {
            this.listPlayers[1].sprite.setVelocityY(600);
        };

        // Player 2
        if (this.WKeyBoard.isDown) {
            this.listPlayers[0].sprite.setVelocityY(-600);
        };

        if (this.SKeyBoard.isDown) {
            this.listPlayers[0].sprite.setVelocityY(600);
        };

        if (Phaser.Input.Keyboard.JustDown(this.EnterKeyBoard)) {
            this.pausedGame = true;
            console.log("Game paused");

            this.scene.pause();
            this.scene.sleep();
            this.scene.launch('PauseScene')
        };

        // Lost - Win detection
        if (this.ballSprite.x <= 30) {
            this.ballSprite.setVelocityX(0);
            this.ballSprite.setVelocityY(0);
            this.endGame = true;

            console.log("You lost");

            this.scene.launch('YouLostScene');
            this.scene.pause();
        }else if(this.ballSprite.x >= 570){
            this.ballSprite.setVelocityX(0);
            this.ballSprite.setVelocityY(0);
            this.endGame = true;

            console.log("You win");

            this.scene.launch('YouWinScene');
            this.scene.pause();
        };
    }

    private async initGame(): Promise<void> {
        // Resets list players position
        this.listPlayers[0].sprite.y = this.game.config.height as number / 2;
        this.listPlayers[1].sprite.y = this.game.config.height as number / 2;

        this.listPlayers[0].sprite.x = 20;
        this.listPlayers[1].sprite.x = 580;

        // Reset ball position
        this.ballSprite.x = this.game.config.width as number / 2;
        this.ballSprite.y = 305;

        let counter = 3;

        await setTimeout(() => {
            counter--;
            this.counterRunGame.setText(`${counter}`);
        }, 1000);

        await setTimeout(() => {
            counter--;
            this.counterRunGame.setText(`${counter}`);
        }, 2000);

        await setTimeout(() => {
            this.counterRunGame.setVisible(false);
            if (parseInt((Math.random() + 0.40).toString()) === 1) {
                this.ballSprite.setVelocityX(Phaser.Math.Between(100, 300));
            }else{
                this.ballSprite.setVelocityX(-Phaser.Math.Between(100, 300));
            };
        }, 3000);
    }

    updateSettings(gameSettings: IGameSettings): void {
        this.#dispatchSettings.next(gameSettings);
    }

    stopScene(): void {
        console.log("RunningScene: receive message stop");

        this.listPlayers = [];
        this.subscriptionSettings.unsubscribe();
        this.bgRunningSound.destroy();
        this.scene.stop();
        this.scene.launch('MainMenuScene');
    }
}
