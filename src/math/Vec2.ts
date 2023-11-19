export class Vec2 extends Float32Array
{
    constructor(x: number = 0, y: number = 0)
    {
        super(2);

        this[0] = x;
        this[1] = y;
    }

    public get x(): number
    {
        return this[0];
    }

    public set x(value: number)
    {
        this[0] = value;
    }

    public get y(): number
    {
        return this[1];
    }

    public set y(value: number)
    {
        this[1] = value;
    }
}