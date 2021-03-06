﻿/***********************************************************************
 *  @actor-player.js
 *
 *  @author:    Dave Voyles
 *  @date:      June 2013
 *  @copyright: (c) 2013 Dave Voyles, under The MIT License (see LICENSE)
 *  @Desc:      Player controlled ship
 ***********************************************************************/
ig.module(
    'game.entities.actor-player'
)
 .requires(
    'game.entities.base-player',
    'game.entities.actor-companion',
    'game.entities.actor-enemySpawner',
    'game.entities.actor-turret'
)
.defines(function () {
    EntityActorPlayer = EntityBasePlayer.extend({

    animSheet:         new ig.AnimationSheet('media/textures/playerShip.png', 44, 50         ),
    font:              new ig.Font('media/fonts/xfinFont.png'                                ),
    boxAroundPlayer:   new ig.Image('media/textures/box-around-player.png'                   ),
    size:              { x:  20, y:  20 },
    offset:            { x:  20, y:  16 },
    friction:          { x: 800, y: 600 },
    angle:             -Math.PI / 2,
    speed:             320,
    health:            1,
    particleCnt:       100,
    slowMoDelay:       3,
    bBossText:         false,
    pu_BT_TextTimer:   null,
    pu_BT_TurretTimer: null,
    pu_Life_TextTimer: null,
    turretSpawnTimer:  null,
    compSpawnTimer:    null,

    /* Respawning */
    invincible:        true,
    invincibleTimer:   null,
    invincibleDelay:   2.5,

    init: function (x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('idle', 60, [0]);
        this.addAnim('shoot', 0.05, [0, 1], true);
        ig.game.player           = this;
        this.lastShootTimer      = new ig.Timer(0);
        this.compSpawnTimer      = new ig.Timer(0);
        this.turretSpawnTimer    = new ig.Timer(0);
        this.tween( {pos: {x: 300}}, 1.5, {easing: ig.Tween.Easing.Sinusoidal.EaseOut}).start();
            
        // Respawning
        this.invincibleTimer     = new ig.Timer();
        this.initTimer           = new ig.Timer(2.5);
        SoundSource.miniShipSpawn.play();
        this.makeInvincible();

        this.livesRemainingTimer = new ig.Timer(3);
        this.bossTextTimer       = new ig.Timer();
        this.slowMoTimer         = new ig.Timer(0);
    },
    draw: function () {
        this.setAlpha();
        this.parent();
        this.drawBulletTimeText();
        this.drawUI();
        this.drawBossText();
        this.draw_pu_BU_Text();
        this.draw_pu_Life_Text();
        this.draw_pu_Turret_Text();
        this.drawRespawnBox();
    },
    setAlpha: function () {
       this.currentAnim.alpha = (this.invincible) ?  0 : 1;
        // Blink if invincible and returning on screen
        if (this.invincible) {
            this.currentAnim.alpha = (  ( (10* this.invincibleTimer.delta() / this.invincibleDelay ) % 1) > 0.5 ? 0.5 : 1 ) ;
        }
    },
    update: function () {
        this.parent();
        this.checkAnims();
        this.handleDesktopInput();
        this.collisionDetection();
        this.spawnCompanion();
        this.spawnTurret();
		this.checkInvincible();
        this.checkDrawBossText();
    },
    checkInvincible: function () {
        if (this.invincibleTimer.delta() > this.invincibleDelay) {
            this.invincible = false;
            this.visible = true;
            this.currentAnim.alpha - 1;
        }
    },
    checkAnims: function () {
        if (this.currentAnim.loopCount > 0) {
            this.currentAnim = this.anims.idle;
        }
    },
    checkDrawBossText: function () {
        if (ig.game.stats.kills + 5 === ig.game.bossSpawnKills && this.bBossText == false) {
            this.bossTextTimer = new ig.Timer(5);
            this.bBossText = true;
        }
    },
    drawRespawnBox: function(){
        if (this.initTimer){
            var d2  = -this.initTimer.delta();
            var a2  = d2 > 2.7 ? d2.map(2, 2.7, 0, 1) : (d2 < 1 ? d2 : 1);
            this.font.alpha = Math.max(a2, 0);
            this.font.draw('Player', this.pos.x + 10, this.pos.y - 70, ig.Font.ALIGN.CENTER);
            this.font.alpha = 1;
      //      this.boxAroundPlayer.draw(this.pos.x - 38, this.pos.y - 40);
            if (d2 < 0){
                this.initTimer = null;
            }
        }
    },
    draw_pu_BU_Text: function () {
        if (this.pu_BT_TextTimer) {
            var d2  = -this.pu_BT_TextTimer.delta();
            var a2  = d2 > 2.7 ? d2.map(2, 2.7, 0, 1) : (d2 < 1 ? d2 : 1);
            var xs2 = ig.system.width / 2;
            var ys2 = ig.system.height / 3 + (d2 < 1 ? Math.cos(1 - d2).map(1, 0, 0, 250) : 0);
            this.font.alpha = Math.max(a2, 0);
            this.font.draw('Bullet Time picked up!', xs2, ys2, ig.Font.ALIGN.CENTER);
            this.font.alpha = 1;
            if (d2 < 0) {
                this.pu_BT_TextTimer = null;
            }
        }
    },
    draw_pu_Life_Text: function () {
        if (this.pu_Life_TextTimer) {
            var d2  = -this.pu_Life_TextTimer.delta();
            var a2  = d2 > 2.7 ? d2.map(2, 2.7, 0, 1) : (d2 < 1 ? d2 : 1);
            var xs2 = ig.system.width / 2;
            var ys2 = ig.system.height / 3 + (d2 < 1 ? Math.cos(1 - d2).map(1, 0, 0, 250) : 0);
            this.font.alpha = Math.max(a2, 0);
            this.font.draw('One Up!', xs2, ys2, ig.Font.ALIGN.CENTER);
            this.font.alpha = 1;
            if (d2 < 0) {
                this.pu_Life_TextTimer = null;
            }
        }
    },
    draw_pu_Turret_Text: function () {
        if (this.pu_BT_TurretTimer) {
            var d2  = -this.pu_BT_TurretTimerdelta();
            var a2  = d2 > 2.7 ? d2.map(2, 2.7, 0, 1) : (d2 < 1 ? d2 : 1);
            var xs2 = ig.system.width / 2;
            var ys2 = ig.system.height / 3 + (d2 < 1 ? Math.cos(1 - d2).map(1, 0, 0, 250) : 0);
            this.font.alpha = Math.max(a2, 0);
            this.font.draw('Turret Acquired!', xs2, ys2, ig.Font.ALIGN.CENTER);
            this.font.alpha = 1;
            if (d2 < 0) {
                this.pu_BT_TurretTimerr = null;
            }
        }
    },
    shoot: function () {
        SoundSource.shoot.play();
        this.currentAnim = this.anims.shoot.rewind();
        // Add a bit of randomness to the shot
        var angle        = -Math.PI / 2 + Math.random() * 0.03 - 0.01;
        ig.game.spawnEntity(EntityPlayerBullet, this.pos.x - 1, this.pos.y + 6, {
            angle: angle
        });
    },
    kill: function () {
        this.onDeath();
        this.parent();
        this.spawnParticles();
    },
    spawnParticles: function () {
    	   var x = this.pos.x + (this.size.x >> 1 );
	       var y = this.pos.y + (this.size.y >> 1 );
    	   ig.game.fragmentSpawner.spawn(x, y, FragmentSpawner.grey ,  this.particleCnt , this.size.x);
    	   ig.game.fragmentSpawner.spawn(x, y, FragmentSpawner.red  ,  this.particleCnt , this.size.x);
	},
    onDeath: function () {
        ig.game.stats.deaths++;
        ig.game.stats.lives--;
        ig.game.screenShaker.applyImpulse(400, 700);
        this.killAllCompanions();

        // End Game
        if(ig.game.stats.lives <= 0){
            ig.game.mode = window.RType.MODE.GAME_OVER;
            ig.game.createGameOverScreen();
        }
        // Respawn and set timer, so text displays on screen
        else {
            this.respawn();
            this.livesRemainingTimer = new ig.Timer(2);
        }
    },
    killAllCompanions: function () {
        var companions = ig.game.getEntitiesByType(EntityCompanion);
        for (var i = 0; i < companions.length; i++) {
            companions[i].kill();
        }
        var turrets = ig.game.getEntitiesByType(EntityTurret);
        for (var i = 0; i < turrets.length; i++) {
            turrets[i].kill();
        }
    },
    respawn: function(){
        ig.game.spawnEntity(EntityActorPlayer, 10, ig.system.height / 2);
    }
    });
});
