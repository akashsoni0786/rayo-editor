type EventCallback<T = unknown> = (data: T) => void;
/**
 * Simple event bus for cross-component communication
 */
declare class EventBus {
    private events;
    /**
     * Subscribe to an event
     * @param event Event name
     * @param callback Function to call when event is emitted
     * @returns Unsubscribe function
     */
    on<T = unknown>(event: string, callback: EventCallback<T>): () => void;
    /**
     * Emit an event with optional arguments
     * @param event Event name
     * @param data Data to pass to callbacks
     */
    emit<T = unknown>(event: string, data?: T): void;
}
export declare const eventBus: EventBus;
export declare const EVENTS: {
    CREDITS_UPDATED: string;
};
export {};
//# sourceMappingURL=eventBus.d.ts.map