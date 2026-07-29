export type Observer<TArgs extends any[] = []> = (...args: TArgs) => void;

/** A simple observable. */
export class Observable<TArgs extends any[] = []> {
    private observers: Set<Observer<TArgs>> = new Set()

    /** Subscribe */
    public subscribe(observer: Observer<TArgs>): Function
    {
        this.observers.add(observer)
        return () => this.unsubscribe(observer)
    }

    /** Un-subscribe */
    unsubscribe(observer: Observer<TArgs>): void
    {
        this.observers.delete(observer)
    }

    /**
     * Notify all observers with the given arguments.
     * @param args The arguments to pass to the observers.
     */
    public onNext(...args: TArgs): void {
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