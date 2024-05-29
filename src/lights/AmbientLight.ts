import { Color } from "../math/Color";
import { UniformBuffer } from "../uniform_buffers/UniformBuffer";
import { BaseLight } from "./BaseLight";

/**
 * The ambient light.
 */
export class AmbientLight extends BaseLight{

    /**
     * The constructor for the ambient light.
     * @param device The GPU device.
     */
    constructor(device: GPUDevice) {
        super();
        this.buffer = new UniformBuffer(device, 4 * Float32Array.BYTES_PER_ELEMENT, "Ambient Light");
    }

    /**
     * Updates the light. Must be called to update the GPU buffer.
     */
    public update() {
        this.buffer.update(new Float32Array([
            this.color.r,
            this.color.g,
            this.color.b,
            this.intensity
        ]));
    }
}