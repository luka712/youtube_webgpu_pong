import { Mat2x2 } from "./Mat2x2";
import { Mat4x4 } from "./Mat4x4";

/**
 * The 3x3 matrix class.
 */
export class Mat3x3 extends Float32Array {
    constructor() {
        super([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]);
    }

    /**
     * The byte size of the matrix.
     */
    public static get BYTE_SIZE() { return 9 * Float32Array.BYTES_PER_ELEMENT; }

    /**
     * Transposes the matrix.
     * @param m - The matrix to transpose.
     * @returns The transposed matrix.
     */
    public static transpose(m: Mat3x3): Mat3x3 {
        const result = new Mat3x3();

        const a = m[0];
        const b = m[1];
        const c = m[2];
        const d = m[3];
        const e = m[4];
        const f = m[5];
        const g = m[6];
        const h = m[7];
        const i = m[8];

        result.set([
            a, b, c,
            d, e, f,
            g, h, i
        ]);
        return result;
    }

    /**
     * Finds the minor of the matrix.
     * @param m - The matrix to find the minor of.
     * @param row - The row to find the minor of.
     * @param col - The column to find the minor of.
     * @returns The minor of the matrix.
     */
    public static minor(m: Mat3x3, row: number, col: number): number {
        return Mat2x2.determinant(Mat3x3.subMatrix(m, row, col));
    }

    /**
     * Find the cofactor of the matrix.
     * @param m - The matrix to find the cofactor of.
     * @param row - The row to find the cofactor of.
     * @param col - The column to find the cofactor of.
     * @returns The cofactor of the matrix.
     */
    public static cofactor(m: Mat3x3, row: number, col: number): number {
        let sign = 1;

        // For cofactor rule is
        // | + - + |
        // | - + - |
        // | + - + |

        // if odd
        if ((row + col) % 2 == 1) {
            sign = -1;
        }

        let minor = Mat3x3.minor(m, row, col);
        let result = minor * sign;
        return result;
    }

    /**
     * Gets the submatrix of the matrix.
     * @param m - The matrix to get the submatrix of.
     * @param row - The row to get the submatrix of.
     * @param col - The column to get the submatrix of.
     * @returns The submatrix of the matrix.
     */
    public static subMatrix(m: Mat3x3, row: number, col: number): Mat2x2 {
        if (row > 2) {
            row = 2;
        }
        if (col > 2) {
            col = 2;
        }

        const result = new Mat2x2();

        let i = 0;
        let j = 0;

        for (let c = 0; c < 3; c++) {
            if (c == col) continue;
            for (let r = 0; r < 3; r++) {
                if (r == row) continue;

                // get value from mat3x3 and move it to appropriate 2x2 position. 
                result[j * 2 + i] = m[c * 3 + r];
                i++;
            }
            j++;
            i = 0;
        }

        return result;
    }

    /**
     * Find the determinant of the matrix.
     * @param m - The matrix to find the determinant of.
     * @returns The determinant of the matrix.
     */
    public static determinant(m: Mat3x3): number {
        const a = Mat3x3.cofactor(m, 0, 0);
        const b = Mat3x3.cofactor(m, 0, 1);
        const c = Mat3x3.cofactor(m, 0, 2);

        return m[0] * a + m[3] * b + m[6] * c;
    }

    /**
     * Inverts the matrix.
     * @param m - The matrix to invert.
     * @returns The inverted matrix.
     */
    public static inverse(m: Mat3x3): Mat3x3 {

        const d = Mat3x3.determinant(m); //  m.determinant();
        const out = new Mat3x3();

        for (let c = 0; c < 3; c++) {
            for (let r = 0; r < 3; r++) {
                const cofactor = Mat3x3.cofactor(m, r, c);

                // note the fliped for col in index
                out[r * 3 + c] = cofactor / d;
            }
        }

        return out;
    }

    /**
     * Creates a 3x3 matrix from a 4x4 matrix.
     * @param m - The 4x4 matrix to create the 3x3 matrix from.
     * @returns - The 3x3 matrix.
     */
    public static fromMat4x4(m: Mat4x4): Mat3x3 {
        const r = new Mat3x3();
        r.set([
            m[0], m[1], m[2],
            m[4], m[5], m[6],
            m[8], m[9], m[10]
        ]);
        return r;
    }

    /**
     * Transforms a 3x3 matrix to a 16 aligned 4x4 matrix.
     * @param m - The 3x3 matrix to transform.
     * @returns The 16 aligned 4x4 matrix.
     */
    public static to16AlignedMat3x3(m: Mat3x3): Float32Array {

        const result = new Float32Array(16);
        result.set([
            m[0], m[3], m[6], 0,
            m[1], m[4], m[7], 0,
            m[2], m[5], m[8], 0,
        ]);
        return result;
    }

}