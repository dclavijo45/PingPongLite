export interface IGameSettings {
    gameMode: GameMode,
    music: boolean,
    effects: boolean
}

enum GameMode {
    Keyboard,
    Network
}
