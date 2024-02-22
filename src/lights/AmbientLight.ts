import { Color } from "../math/Color";
import { UniformBuffer } from "../uniform_buffers/UniformBuffer";

export class AmbientLight {
    public color = new Color(1, 1, 1, 1);
    public intensity = 1;

    public buffer: UniformBuffer;

    constructor(device: GPUDevice) {
        this.buffer = new UniformBuffer(device, 4 * Float32Array.BYTES_PER_ELEMENT, "Ambient Light");
    }

    public update() {
        this.buffer.update(new Float32Array([
            this.color.r,
            this.color.g,
            this.color.b,
            this.intensity
        ]));
    }
}