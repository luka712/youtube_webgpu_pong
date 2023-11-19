export class Texture2D {
    public texture!: GPUTexture;
    public sampler!: GPUSampler;

    constructor(private device: GPUDevice) {

    }

    public static async create(device: GPUDevice, image: HTMLImageElement) {
        const texture = new Texture2D(device);
        await texture.initialize(image);
        return texture;
    }

    public static createEmpty(device: GPUDevice): Texture2D {
        const texture = new Texture2D(device);
        texture.initializeFromData(new Uint8Array([255, 255, 255, 255]), 1, 1);
        return texture;
    }

    private createTextureAndSampler(width: number, height: number) {
        this.texture = this.device.createTexture({
            size: { width, height },
            format: "rgba8unorm",
            usage: GPUTextureUsage.COPY_DST
                | GPUTextureUsage.TEXTURE_BINDING
                | GPUTextureUsage.RENDER_ATTACHMENT
        });

        this.sampler = this.device.createSampler({
            magFilter: "linear",
            minFilter: "linear",
            addressModeU: "repeat",
            addressModeV: "repeat",
        });
    }

    public async initialize(image: HTMLImageElement) {
        this.createTextureAndSampler(image.width, image.height);

        const imageBitmap = await createImageBitmap(image);

        this.device.queue.copyExternalImageToTexture(
            { source: imageBitmap },
            { texture: this.texture },
            { width: image.width, height: image.height }
        );
    }

    public async initializeFromData(data: ArrayBuffer, width: number, height: number) {
        this.createTextureAndSampler(width, height);

        this.device.queue.writeTexture(
            { texture: this.texture },
            data,
            {},
            { width, height }
        );
    }
}