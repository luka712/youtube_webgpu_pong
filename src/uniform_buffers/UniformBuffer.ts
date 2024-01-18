export class UniformBuffer {
    
    public readonly buffer: GPUBuffer;

    constructor(private device: GPUDevice, dataOrLength: Float32Array | number, label: string = "Uniform Buffer") {
        
        // if number, we assume byteSize
        if (typeof dataOrLength === "number") {
            this.buffer = device.createBuffer({
                label: label,
                size: dataOrLength, 
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            }); 
        }
        else {
            this.buffer = device.createBuffer({
                label: label,
                size: dataOrLength.byteLength,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            });

            this.update(dataOrLength);
        }
    }

    public update(data: Float32Array, bufferOffset = 0) {
        this.device.queue.writeBuffer(this.buffer, bufferOffset, data.buffer);
    }
}