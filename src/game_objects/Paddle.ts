import { GAME_BOTTOM_BOUND, GAME_TOP_BOUND, PADDLE_SPEED } from "../GameConstants";
import { Camera } from "../camera/Camera";
import { ShadowCamera } from "../camera/ShadowCamera";
import { RectCollider } from "../collider/RectCollider";
import { InputManager } from "../input/InputManager";
import { AmbientLight } from "../lights/AmbientLight";
import { DirectionalLight } from "../lights/DirectionalLight";
import { PointLightsCollection } from "../lights/PointLight";
import { Vec3 } from "../math/Vec3";
import { BaseGameObject } from "./BaseGameObject";

/**
 * The paddle game object.
 */
export class Paddle extends BaseGameObject {

    public playerOne = true;

    public collider = new RectCollider();

    /**
      * The base game object constructor.
      * @param device - The GPU device.
      * @param camera - The camera.
      * @param shadowCamera - The shadow camera.
      * @param ambientLight - The ambient light.
      * @param directionalLight - The directional light.
      * @param pointLights - The point lights.
      */
    constructor(
        private readonly _inputManager: InputManager,
        device: GPUDevice,
        camera: Camera,
        shadowCamera: ShadowCamera,
        ambientLight: AmbientLight,
        directionalLight: DirectionalLight,
        pointLights: PointLightsCollection) {

        super(device, camera, shadowCamera, ambientLight, directionalLight, pointLights);

        this.scale = new Vec3(1, 5, 1);
    }

    /**
     * Updates the game object. Must be updated every frame.
     */
    public update(): void {
        let dirY = 0;

        if (this.playerOne) {
            if (this._inputManager.isKeyDown("w")) {
                dirY = 1;
            }
            if (this._inputManager.isKeyDown("s")) {
                dirY = -1;
            }
        }
        else {
            if (this._inputManager.isKeyDown("ArrowUp")) {
                dirY = 1;
            }
            if (this._inputManager.isKeyDown("ArrowDown")) {
                dirY = -1;
            }
        }

        // Move the paddle.
        this.position.y += dirY * PADDLE_SPEED;

        // Clamp to bounds.
        if (this.position.y > GAME_TOP_BOUND)
            this.position.y = GAME_TOP_BOUND;

        if (this.position.y < GAME_BOTTOM_BOUND)
            this.position.y = GAME_BOTTOM_BOUND;

        this._handleTransformUpdate();
        this._updateCollider();
    }
}