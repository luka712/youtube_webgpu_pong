import { Color } from "../math/Color";
import { Vec3 } from "../math/Vec3";
import { UniformBuffer } from "../uniform_buffers/UniformBuffer";

export class PointLight {
    public color = new Color(1, 1, 1, 1);
    public intensity = 1;
    public position = new Vec3(0, 0, 0);
}

export class PointLightsCollection {
    public buffer: UniformBuffer;

    public pointLigts = [
        new PointLight(),
        new PointLight(),
        new PointLight()
    ]

    constructor(device: GPUDevice) {
        this.buffer = new UniformBuffer(device, 3 * 8 * Float32Array.BYTES_PER_ELEMENT, "Point Lights");
    }

    public update() {

        for(let i = 0; i < 3; i++) {
            const pointLight = this.pointLigts[i];

            this.buffer.update(new Float32Array([
                pointLight.color.r,
                pointLight.color.g,
                pointLight.color.b,
                pointLight.intensity,
                pointLight.position.x,
                pointLight.position.y,
                pointLight.position.z,
                0
            ]), i * 8 * Float32Array.BYTES_PER_ELEMENT);
        }

       
    }
}