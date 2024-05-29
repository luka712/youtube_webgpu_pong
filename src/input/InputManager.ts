
/**
 * Handles input from the user.
 */
export class InputManager {

    private keys: Map<string, boolean> = new Map<string, boolean>();

    constructor()
    {
        window.addEventListener("keydown", (e) => {
            this.keys.set(e.key, true);
        });

        window.addEventListener("keyup", (e) => {
            this.keys.set(e.key, false);
        });
    }

    /**
     * Checks if a key is down. Returns true if the key is down, false otherwise.
     * @param key The key to check.
     * @returns True if the key is down, false otherwise.
     */
    public isKeyDown(key: string): boolean
    {
        return this.keys.get(key) || false;
    }
}