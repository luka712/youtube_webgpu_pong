export class RectCollider {
    public x = 0
    public y = 0
    public width = 0
    public height = 0

    public intersects(other: RectCollider): boolean {
        return this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y;
    }
}