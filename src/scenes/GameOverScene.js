import Phaser from "phaser";

var replayButton
export default class GameOverScene extends Phaser.Scene{
    constructor() {
        super('game-over-scene');
    }

    preload(){
        this.load.image('background', 'images/bg_layer1.png')
        this.load.image('game-over-text', 'images/gameover.png')
        this.load.image('replay-button', 'images/replay.png')
        this.load.audio('game-over-sound', 'sfx/gameOverSound.mp3')
        this.load.audio('reload-sound', 'sfx/reload.mp3')
    }

    create(){
        this.add.image(240, 320, 'background')
        this.add.image(240, 280, 'game-over-text')
        this.add.image(240, 450, 'replay-button')
        this.sound.play('game-over-sound', {volume: 2})

        this.replayButton = this.add.image(240, 450, 'replay-button').setInteractive()

        this.replayButton.once('pointerup', ()=>{
            this.scene.start('bunny-jump-scene')
            this.sound.play('reload-sound')

        }, this)
    }




}
