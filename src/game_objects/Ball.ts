import { BALL_SPEED } from "../GameConstants";
import { Vec2 } from "../math/Vec2";
import { BaseGameObject } from "./BaseGameObject";
import { Paddle } from "./Paddle";

/**
 * The ball game object.
 */
export class BallGameObject extends BaseGameObject {

    private direction = new Vec2(10, 1);

    /**
     * Updates the game object.
     */
    public update() {
        this.direction.normalize();
        this.position.x += this.direction.x * BALL_SPEED;
        this.position.y += this.direction.y * BALL_SPEED;

        if (this.position.y > 5 || this.position.y < -5) {
            this.direction.y *= -1;
        }

        this._handleTransformUpdate();
        this._updateCollider();
    }

    /**
     * Checks collision with a paddle. If collision is detected, the ball will bounce off the paddle.
     * @param paddle - The paddle to check collision with.
     */
    public collidesPaddle(paddle: Paddle) {
        if (this.collider.intersects(paddle.collider)) {
            this.direction.x *= -1;
        }
    }
}