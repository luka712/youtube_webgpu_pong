export class Mat2x2 extends Float32Array {
    constructor() {
        super([
            1, 0,
            0, 1
        ]);
    }

    public static get BYTE_SIZE() { return 4 * Float32Array.BYTES_PER_ELEMENT; }

    public static determinant(m: Mat2x2): number {
        return m[0] * m[3] - m[1] * m[2];
    }

   
}