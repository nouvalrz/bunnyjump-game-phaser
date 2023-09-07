import Phaser from "phaser";
import Carrot from "../game/Carrot";


var platforms
var player
var cursors
var carrots
var carrotCollected
var carrotCollectedText
var background

export default class BunnyJumpScene extends Phaser.Scene{
    constructor() {
        super('bunny-jump-scene');
    }

    preload(){
        this.load.image('background', 'images/bg_layer1.png')
        this.load.image('platform', 'images/ground_grass.png')
        this.load.image('platformRock', 'images/rockPlatform.png')
        this.load.image('backgroundCliff', 'images/cliff_bg.png')
        this.load.image('carrot', 'images/carrot.png')
        this.load.image('bunny_jump', 'images/bunny1_jump.png')
        this.load.image('bunny_stand', 'images/bunny1_stand.png')
        this.load.audio('jumpSound', 'sfx/phaseJump1.ogg')
        this.load.audio('collectCarrot', 'sfx/collectCarrot.mp3')
        this.load.audio('nextLevel', 'sfx/next-level.mp3')

        this.load.image('red', 'https://labs.phaser.io/assets/particles/red.png')
    }

    create(){
        this.background =  this.add.image(240, 320, 'background').setScrollFactor(1, 0)
        // this.add.image(240, 320, 'platform')

        this.platforms = this.physics.add.staticGroup()


        for(let i = 0 ; i<5; i++){
            const x = Phaser.Math.Between(80, 400)
            const y = 150 * i
            const platformChild = this.platforms.create(x, y, 'platform')
            platformChild.setScale(0.5)
            platformChild.refreshBody()
            const body = platformChild.body
            body.updateFromGameObject()
        }
        const particles = this.add.particles('red')

        const emitter = this.add.particles(0, 0, "red", {
            speed: 10,
            scale: { start: 1, end: 0,  },
            // blendMode: "ADD",
            alpha: 0.1
            // quantity: 5

        });

        this.player = this.physics.add.sprite(240, 320, 'bunny_stand').setScale(0.5)

        emitter.startFollow(this.player, 0, 70)
        this.physics.add.collider(this.player, this.platforms)

        this.player.body.checkCollision.up = false
        this.player.body.checkCollision.left = false
        this.player.body.checkCollision.right = false

        this.cameras.main.startFollow(this.player)

        this.cursors = this.input.keyboard.createCursorKeys()

        this.cameras.main.setDeadzone(this.scale.width * 1.5)

        this.carrots = this.physics.add.group({
            classType: Carrot
        })

        this.physics.add.collider(this.platforms, this.carrots)

        this.carrotCollected = 0

        const style = {color: '#FF0000', fontSize: 24, strokeColor: '#FFF', strokeThickness: 10}
        this.carrotCollectedText =  this.add.text(100, 10, 'Carrots : 0', style).setScrollFactor(0).setOrigin(0.5, 0)

        this.add.text(250, 600, 'by Mr Nouval', style).setScrollFactor(0).setOrigin(0.5, 0)

    }

    update(){
        const touchingDown = this.player.body.touching.down

        if(touchingDown){
            this.player.setVelocityY(-300)
            this.player.setTexture('bunny_jump')
            this.sound.play('jumpSound')
        }

        const vy = this.player.body.velocity.y

        if(vy > 0 && this.player.texture.key !== 'bunny_stand'){
            this.player.setTexture('bunny_stand')
        }

        if(this.cursors.left.isDown && !touchingDown){
            this.player.setVelocityX(-200)
        }else if(this.cursors.right.isDown && !touchingDown){
            this.player.setVelocityX(200)
        }else{
            this.player.setVelocityX(0)
        }

        this.platforms.children.iterate((child)=>{
            if(this.carrotCollected >= 5){
                child.setTexture('platformRock').setScale(0.25)
            }
        })



        this.platforms.children.iterate((child)=>{
            let platformChild = child
            const scrollY = this.cameras.main.scrollY
            if(platformChild.y >= scrollY + 700){
                platformChild.y = scrollY - Phaser.Math.Between(50, 100)
                platformChild.body.updateFromGameObject()

                this.addCarrotAbove(platformChild)
            }
        })
        this.horizotalWrap(this.player)

        this.physics.add.overlap(this.player, this.carrots, this.handleCollectCarrot, undefined, this)

        const bottomPlatform = this.findBottomMostPlatform()

        if(this.player.y > bottomPlatform.y + 200){
            this.scene.start('game-over-scene')
        }

    }

    horizotalWrap(sprite){
        const halfWidth = sprite.displayWidth * 0.5
        const gameWidth  = this.scale.width
        if(sprite.x < -halfWidth){
            sprite.x = gameWidth + halfWidth
        }else if(sprite.x > gameWidth + halfWidth){
            sprite.x = -halfWidth
        }

    }

    addCarrotAbove(sprite) {
        const y = sprite.y - sprite.displayHeight
        const carrot = this.carrots.get(sprite.x, y, 'carrot')
        carrot.setActive(true)
        carrot.setVisible(true)

        this.add.existing(carrot)
        carrot.body.setSize(carrot.width, carrot.height)
        this.physics.world.enable(carrot)

        return carrot
    }


    handleCollectCarrot(player, carrot){
        this.carrots.killAndHide(carrot)
        this.physics.world.disableBody(carrot.body)
        this.sound.play('collectCarrot', {volume: 0.3})
        this.carrotCollected++
        if(this.carrotCollected === 5){
            this.changeToMapCliff()
        }
        const value = `Carrots: ${this.carrotCollected}`
        this.carrotCollectedText.text = value;
    }

    findBottomMostPlatform(){
        const platforms = this.platforms.getChildren();
        let bottomPlatform = platforms[0];

        for (let i = 1 ; i  < platforms.length ; i++){
            const platform = platforms[i]


            if(platform.y < bottomPlatform.y){
                continue
            }

            bottomPlatform = platform
        }

        return bottomPlatform
    }

    changeToMapCliff(){
        this.background.setTexture('backgroundCliff')
        this.sound.play('nextLevel')
    }
}
