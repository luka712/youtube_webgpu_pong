export class Geometry 
{
    constructor(
        public positions: Float32Array,
        public indices: Uint16Array = new Uint16Array(),
        public colors: Float32Array = new Float32Array(),
        public texCoords: Float32Array = new Float32Array()
    )
    {}
}