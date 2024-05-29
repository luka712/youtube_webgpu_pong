import { Color } from "../math/Color";
import { Vec3 } from "../math/Vec3";
import { UniformBuffer } from "../uniform_buffers/UniformBuffer";
import { BaseLight } from "./BaseLight";

/**
 * The directional light.
 */
export class DirectionalLight extends BaseLight {
    /**
     * The direction of the light.
     */
    public direction: Vec3 = new Vec3(0, -1, 0);

    /**
     * The specular color of the light.
     */
    public specularColor: Color = Color.white();

    /**
     * The specular intensity of the light.
     */
    public specularIntensity: number = 1;

    /**
     * The constructor for the directional light.
     * @param device The GPU device.
     */
    constructor(device: GPUDevice) {
        super();
        const byteSize = 12 * Float32Array.BYTES_PER_ELEMENT;
        this.buffer = new UniformBuffer(device, byteSize, "Directional Light Buffer");
    }

    /**
      * Updates the light. Must be called to update the GPU buffer.
      */
    public update() {
        this.buffer.update(new Float32Array(
            [
                this.color.r, this.color.g, this.color.b, this.intensity,
                this.direction.x, this.direction.y, this.direction.z, 0,
                this.specularColor.r, this.specularColor.g, this.specularColor.b, this.specularIntensity
            ]));
    }
}