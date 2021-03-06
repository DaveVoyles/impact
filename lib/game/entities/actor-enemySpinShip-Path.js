/*************************************************************************
 *  @actor-enemySpinShip-Path.js
 *  @author:    Dave Voyles
 *  @date:      June 2013
 *  @copyright: (c) 2013 Dave Voyles, under The MIT License (see LICENSE)
 *  @desc:      Spinning ship, but follows a path
 ***********************************************************************/
ig.module(
    'game.entities.actor-enemySpinShip-Path'
)
.requires(
    'game.entities.base-enemy'
)
.defines(function () {

    EntityActorEnemySpinShipPath = EntityBaseEnemy.extend({

        animSheet:   new ig.AnimationSheet('media/textures/actor-enemyKamikaze.png#ff5862', 38, 48),
        size:        { x:  30, y: 30 },
        offset:      { x:  +2, y: +4 },
        friction:    { x: 150, y:  0 },
        health:      7,
        shootTimer:  null,
        firingTimer: 1.2,

        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('fly', 0.1, [0, 1, 2, 3, 4, 5, 6, 7]);
            this.shootTimer = new ig.Timer(this.firingTimer);
        },
        update: function () {
            this.parent();

            if (this.player.pos.x + 350 > this.pos.x) {
                if (this.shootTimer.delta() > 0) {
                    this.shootBullets();
                }
            }
        },
        shootBullets: function () {

            // Set X and Y values for each bullet leaving the ship
            this.bulletx = this.pos.x + 24;
            this.bullety = this.pos.y + 44;

            ig.game.spawnEntity(EntityObjectEnemyBulletBlue, this.pos.x - 1, this.pos.y - 1);

            // Resets shoot timer after every shot
            this.shootTimer.reset();
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
