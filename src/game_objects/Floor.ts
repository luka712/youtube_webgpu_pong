import { Camera } from "../camera/Camera";
import { ShadowCamera } from "../camera/ShadowCamera";
import { AmbientLight } from "../lights/AmbientLight";
import { DirectionalLight } from "../lights/DirectionalLight";
import { PointLightsCollection } from "../lights/PointLight";
import { Color } from "../math/Color";
import { Vec3 } from "../math/Vec3";
import { BaseGameObject } from "./BaseGameObject";

/**
 * The floor game object.
 */
export class Floor extends BaseGameObject {

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
        device: GPUDevice,
        camera: Camera,
        shadowCamera: ShadowCamera,
        ambientLight: AmbientLight,
        directionalLight: DirectionalLight,
        pointLights: PointLightsCollection) {

        super(device, camera, shadowCamera, ambientLight, directionalLight, pointLights);

        this.scale = new Vec3(40, 40, 1);
        this.position = new Vec3(0, 0, 4);
        this.color = new Color(0.2, 0.2, 0.2, 1);
    }

    /**
     * Updates the game object. Must be updated every frame.
     */
    public update(): void {
        this._handleTransformUpdate();
    }
}