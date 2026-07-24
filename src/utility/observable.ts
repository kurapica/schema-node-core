/** A simple observable. */
export class Observable
{
    private observers: Set<Function> = new Set()

    /** Subscribe */
    public subscribe(observer: Function): Function
    {
        this.observers.add(observer)
        return () => this.unsubscribe(observer)
    }

    /** Un-subscribe */
    unsubscribe(observer: Function): void
    {
        this.observers.delete(observer)
    }

    /**
     * Notify all observers with the given arguments.
     * @param args The arguments to pass to the observers.
     */
    public onNext(...args: any[]): void
    {
        this.observers.forEach(observer => {
            try {
                observer(...args)
            } catch (error) {
                console.error("Error in observer:", error)
            }
        })
    }

    /** Clear all observers */
    public dispose(): void
    {
        this.observers.clear()
    }
}