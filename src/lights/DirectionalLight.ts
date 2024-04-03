import { Color } from "../math/Color";
import { Vec3 } from "../math/Vec3";
import { UniformBuffer } from "../uniform_buffers/UniformBuffer";

export class DirectionalLight 
{
    public color: Color = Color.white();
    public intensity: number = 1;
    public direction: Vec3 = new Vec3(0,-1,0);
    public specularColor: Color = Color.white();
    public specularIntensity: number = 1;

    public buffer: UniformBuffer;

    constructor(device: GPUDevice) {
        const byteSize = 12 * Float32Array.BYTES_PER_ELEMENT;
        this.buffer = new UniformBuffer(device, byteSize, "Directional Light Buffer");
    }

    public update() 
    {
        this.buffer.update(new Float32Array(
            [
                this.color.r, this.color.g, this.color.b, this.intensity,
                this.direction.x, this.direction.y, this.direction.z, 0,
                this.specularColor.r, this.specularColor.g, this.specularColor.b, this.specularIntensity
            ]));
    }
}