import Phaser from "phaser";
import Carrot from "../game/Carrot";


var platforms
var player
var cursors
var carrots
var carrotCollected
var carrotCollectedText

export default class BunnyJumpScene extends Phaser.Scene{
    constructor() {
        super('bunny-jump-scene');
    }

    preload(){
        this.load.image('background', 'images/bg_layer1.png')
        this.load.image('platform', 'images/ground_grass.png')
        this.load.image('carrot', 'images/carrot.png')
        this.load.image('bunny_jump', 'images/bunny1_jump.png')
        this.load.image('bunny_stand', 'images/bunny1_stand.png')
    }

    create(){
        this.add.image(240, 320, 'background').setScrollFactor(1, 0)
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

        this.player = this.physics.add.sprite(240, 320, 'bunny_stand').setScale(0.5)
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

        const style = {color: '#000', fontSize: 24}
        this.carrotCollectedText =  this.add.text(240, 10, 'Carrots : 0', style).setScrollFactor(0).setOrigin(0.5, 0)

    }

    update(){
        const touchingDown = this.player.body.touching.down

        if(touchingDown){
            this.player.setVelocityY(-300)
            this.player.setTexture('bunny_jump')
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
            const platformChild = child
            const scrollY = this.cameras.main.scrollY
            if(platformChild.y >= scrollY + 700){
                platformChild.y = scrollY - Phaser.Math.Between(50, 100)
                platformChild.body.updateFromGameObject()

                this.addCarrotAbove(platformChild)
            }
        })
        this.horizotalWrap(this.player)

        this.physics.add.overlap(this.player, this.carrots, this.handleCollectCarrot, undefined, this)
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
        this.carrotCollected++
        const value = `Carrots: ${this.carrotCollected}`
        this.carrotCollectedText.text = value;
    }
}
