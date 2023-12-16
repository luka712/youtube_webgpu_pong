export class Mat4x4 extends Float32Array {
    constructor() {
        super([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    public static identity(): Mat4x4 {
        return new Mat4x4();
    }

    public static translation(x: number, y: number, z: number): Mat4x4 {
        const m = new Mat4x4();
        m.set([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ])
        return m;
    }

    public static scale(x: number, y: number, z: number): Mat4x4 {
        const m = new Mat4x4();
        m.set([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ])
        return m;
    }

    public static rotationZ(angle: number): Mat4x4 {
        const s = Math.sin(angle);
        const c = Math.cos(angle);

        const m = new Mat4x4();
        m.set([
            c, -s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);

        return m;
    }

    public static orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4x4 {
        const r0c0 = 2 / (right - left);
        const r1c2 = 2 / (top - bottom);
        const r2c2 = 1 / (far - near);

        const r3c0 = -(right + left) / (right - left); // -1 to 1 
        const r3c1 = -(top + bottom) / (top - bottom); // -1 to 1
        const r3c2 = -near / (far - near); // 0 to 1

        const m = new Mat4x4();
        m.set([
            r0c0, 0, 0, 0,
            0, r1c2, 0, 0,
            0, 0, r2c2, 0,
            r3c0, r3c1, r3c2, 1
        ]);
        return m;
    }
}