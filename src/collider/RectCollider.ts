
/**
 * RectCollider is a simple rectangle collider that uses the AABB (Axis-Aligned Bounding Box) collision detection method.
 */
export class RectCollider {

    /**
     * The x position of the collider.
     */
    public x = 0

    /**
     * The y position of the collider.
     */
    public y = 0

    /**
     * The width of the collider.
     */
    public width = 0
    
    /**
     * The height of the collider.
     */
    public height = 0

    /**
     * Check if this collider intersects with another collider. If the colliders intersect, it returns true.
     * @param other - The other collider to check against.
     * @returns - True if the colliders intersect, false otherwise.
     */
    public intersects(other: RectCollider): boolean {
        return this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y;
    }
}