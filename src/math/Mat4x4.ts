import { MathUtil } from "./MathUtil";
import { Vec3 } from "./Vec3";

export class Mat4x4 extends Float32Array {
    constructor() {
        super([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    public static get BYTE_SIZE() { return 16 * Float32Array.BYTES_PER_ELEMENT; }

    public static multiply(a: Mat4x4, b: Mat4x4): Mat4x4 {

        const r0c0 = a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3];
        const r1c0 = a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7];
        const r2c0 = a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11];
        const r3c0 = a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15];

        const r0c1 = a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3];
        const r1c1 = a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7];
        const r2c1 = a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11];
        const r3c1 = a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15];

        const r0c2 = a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3];
        const r1c2 = a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7];
        const r2c2 = a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11];
        const r3c2 = a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15];

        const r0c3 = a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3];
        const r1c3 = a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7];
        const r2c3 = a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11];
        const r3c3 = a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15];

        const m = new Mat4x4();
        m.set([
            r0c0, r0c1, r0c2, r0c3,
            r1c0, r1c1, r1c2, r1c3,
            r2c0, r2c1, r2c2, r2c3,
            r3c0, r3c1, r3c2, r3c3
        ]);

        return m;
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

    public static rotationX(angle: number): Mat4x4 {
        const s = Math.sin(angle);
        const c = Math.cos(angle);

        const m = new Mat4x4();
        m.set([
            1, 0, 0, 0,
            0, c, -s, 0,
            0, s, c, 0,
            0, 0, 0, 1
        ]);

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

    public static perspective(fov: number, aspect: number, near: number, far: number): Mat4x4 {

        const r = MathUtil.toRadians(fov);

        const r0c0 = 1 / (aspect * Math.tan(r / 2));
        const r1c1 = 1 / Math.tan(r / 2);

        const r2c2 = -far / (near - far);
        const r3c2 = (near * far) / (near - far);

        const m = new Mat4x4();
        m.set([
            r0c0, 0, 0, 0,
            0, r1c1, 0, 0,
            0, 0, r2c2, 1,
            0, 0, r3c2, 0
        ]);
        return m;
    }


    public static transpose(m: Mat4x4): Mat4x4 {
        const t = new Mat4x4();
        t.set([
            m[0], m[4], m[8], m[12],
            m[1], m[5], m[9], m[13],
            m[2], m[6], m[10], m[14],
            m[3], m[7], m[11], m[15]
        ]);
        return t;
    }

    public static lookAt(eye : Vec3 , target: Vec3, up: Vec3): Mat4x4
    {
        const forward = Vec3.normalize(Vec3.subtract(target, eye));
        const right = Vec3.normalize(Vec3.cross( up, forward));
        up  = Vec3.cross(forward, right);

        const lookAt = new Mat4x4();
        lookAt.set([
            right.x, up.x,forward.x,0,
            right.y,up.y, forward.y,0,
            right.z,up.z,forward.z,0,
            -Vec3.dot(eye, right),-Vec3.dot(eye, up),-Vec3.dot(eye, forward),1
        ]);

        return lookAt
    }

    public static lookAt2(eye : Vec3 , target: Vec3, up: Vec3): Mat4x4
    {
        const translate = Mat4x4.translation(-eye.x, -eye.y, -eye.z);

        const forward = Vec3.normalize(Vec3.subtract(target, eye));
        const right = Vec3.normalize(Vec3.cross( up, forward));
        up  = Vec3.cross(forward, right);
        const rotation = new Mat4x4();

        rotation.set([
            right.x, right.y,right.z,0,
            up.x,up.y,up.z,0,
            forward.x,forward.y,forward.z,0,
            0,0,0,1
        ]);

        return Mat4x4.multiply(Mat4x4.transpose(rotation), translate);
    }
}