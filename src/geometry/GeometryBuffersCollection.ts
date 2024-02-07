import { GeometryBuffers } from "../attribute_buffers/GeometryBuffers";
import { GeometryBuilder } from "./GeometryBuilder";

export class GeometryBuffersCollection {

    public static cubeBuffers: GeometryBuffers;

    public static initialize(device: GPUDevice) {
        const geometry = new GeometryBuilder().createCubeGeometry();
        this.cubeBuffers = new GeometryBuffers(device, geometry);
    }

}