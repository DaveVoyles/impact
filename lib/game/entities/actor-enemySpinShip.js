﻿/*************************************************************************
 *  @actor-enemySpinShip.js
 *
 *  @author:    Dave Voyles
 *  @date:      June 2013
 *  @copyright: (c) 2013 Dave Voyles, under The MIT License (see LICENSE)
 *  @desc:      Flies alongside Kamikaze, shoots bullets
 ***********************************************************************/
ig.module(
	'game.entities.actor-enemySpinShip'
)
.requires(
    'game.entities.base-enemy'
)
.defines(function () {

    EntityActorEnemySpinShip = EntityBaseEnemy.extend({

    animSheet: new ig.AnimationSheet('media/textures/actor-enemyKamikaze-lg.png', 63.3, 50),
    size:        { x:  30, y:  30 },
    offset:      { x: +16, y: +14 },
    friction:    { x: 150, y:  0 },
    health:      7,
    shootTimer:  null,
    firingTimer: 1.3,

    init: function (x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('fly', 0.1, [0, 1, 2, 3, 4, 5, 6, 7]);
        this.shootTimer = new ig.Timer(this.firingTimer);
        this.tween( {pos: {x: ig.system.width - 200}}, 2, {easing: ig.Tween.Easing.Quartic.EaseOut}).start();
    },
    update: function () {
        this.parent();

        this.vel.x = this.kamikazeVelocity;
        if (this.player.pos.x + 750 > this.pos.x) {
            if (this.shootTimer.delta() > 0) {
                this.shootBullets();
            } 
        }
        this.pursuePlayer();
        this.speedBurst();
    },
    shootBullets: function () {

        // Set X and Y values for each bullet leaving the ship    
        this.bulletx = this.pos.x + 24;
        this.bullety = this.pos.y + 44;

        ig.game.spawnEntity(EntityObjectEnemyBulletBlue, this.pos.x - 1, this.pos.y - 10);
        ig.game.spawnEntity(EntityObjectEnemyBulletBlue, this.pos.x - 1, this.pos.y + 10);

        // Resets shoot timer after every shot
        this.shootTimer.reset();
    },
    pursuePlayer: function(){
        if (this.distanceTo(this.player) < 450) {
            var angle = this.angleToCorr(this.player);
            var x     = Math.cos(angle);
            var y     = Math.sin(angle);

            this.vel.x = x * -this.kamikazeSpeed;
            this.vel.y = y * -this.kamikazeSpeed;
        }
    },
    speedBurst: function(){
        if (this.pos.x + 3 < this.player.pos.x) {
            this.vel.x = this.kamikazeSpeed;
        }
    },
    receiveDamage: function (value, from) {
        this.parent(value, from);
        if (this.health > 1) {
        	var x = this.pos.x + (this.size.x >> 1 );
	        var y = this.pos.y + (this.size.y >> 1 );
            ig.game.fragmentSpawner.spawn(x,y,FragmentSpawner.grey ,  this.particleKillCount , this.size.x);
	    }
    }
});
});
