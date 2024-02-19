import { Geometry } from "../geometry/Geometry";

export class GeometryBuffers {
    public readonly positionsBuffer: GPUBuffer;
    public readonly indicesBuffer?: GPUBuffer;
    public readonly colorsBuffer: GPUBuffer;
    public readonly texCoordsBuffer: GPUBuffer;
    public readonly normalsBuffer: GPUBuffer;

    public readonly vertexCount: number;
    public readonly indexCount?: number;

    constructor(device: GPUDevice, geometry: Geometry) {
        // POSITIONS
        this.positionsBuffer = device.createBuffer({
            label: "Positions Buffer",
            size: geometry.positions.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        device.queue.writeBuffer(this.positionsBuffer,
            0,
            geometry.positions.buffer,
            0,
            geometry.positions.byteLength);

        this.vertexCount = geometry.positions.length / 3; // (xyz)


        // INDICES
        if (geometry.indices.length > 0) {
            this.indicesBuffer = device.createBuffer({
                label: "Indices Buffer",
                size: geometry.indices.byteLength,
                usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
            });

            device.queue.writeBuffer(this.indicesBuffer,
                0,
                geometry.indices.buffer,
                0,
                geometry.indices.byteLength);

            this.indexCount = geometry.indices.length;
        }

        // COLORS
        this.colorsBuffer = device.createBuffer({
            label: "Colors Buffer",
            size: geometry.colors.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        device.queue.writeBuffer(this.colorsBuffer,
            0,
            geometry.colors.buffer,
            0,
            geometry.colors.byteLength);

        // TEXCOORDS
        this.texCoordsBuffer = device.createBuffer({
            label: "TexCoords Buffer",
            size: geometry.texCoords.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        device.queue.writeBuffer(this.texCoordsBuffer,
            0,
            geometry.texCoords.buffer,
            0,
            geometry.texCoords.byteLength);

        // NORMALS
        this.normalsBuffer = device.createBuffer({
            label: "Normals Buffer",
            size: geometry.normals.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        device.queue.writeBuffer(this.normalsBuffer,
            0,
            geometry.normals.buffer,
            0,
            geometry.normals.byteLength);
    }
}