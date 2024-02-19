import { Color } from "../math/Color";
import { UniformBuffer } from "../uniform_buffers/UniformBuffer";


export class AmbientLight {

    public color: Color = Color.white();
    public intensity: number = 1;

    public buffer: UniformBuffer;

    constructor(device: GPUDevice) {
        const byteSize = 4 * Float32Array.BYTES_PER_ELEMENT;
        this.buffer = new UniformBuffer(device, byteSize, "Ambient Light Buffer");
    }

    public update() {
        this.buffer.update(new Float32Array([this.color.r, this.color.g, this.color.b, this.intensity]));
    }
    
}