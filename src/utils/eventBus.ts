type EventCallback<T = unknown> = (data: T) => void;

interface EventMap {
  [event: string]: EventCallback[];
}

/**
 * Simple event bus for cross-component communication
 */
class EventBus {
  private events: EventMap = {};

  /**
   * Subscribe to an event
   * @param event Event name
   * @param callback Function to call when event is emitted
   * @returns Unsubscribe function
   */
  on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(callback as EventCallback);
    console.log(`[EventBus] Subscribed to event: ${event}, total listeners: ${this.events[event].length}`);
    
    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
      console.log(`[EventBus] Unsubscribed from event: ${event}, remaining listeners: ${this.events[event].length}`);
    };
  }

  /**
   * Emit an event with optional arguments
   * @param event Event name
   * @param data Data to pass to callbacks
   */
  emit<T = unknown>(event: string, data?: T): void {
    console.log(`[EventBus] Emitting event: ${event}`, data);
    if (this.events[event]) {
      console.log(`[EventBus] Found ${this.events[event].length} listeners for event: ${event}`);
      for (const callback of this.events[event]) {
        callback(data as unknown);
      }
    } else {
      console.log(`[EventBus] No listeners found for event: ${event}`);
    }
  }
}

// Export a singleton instance
export const eventBus = new EventBus();

// Event names as constants
export const EVENTS = {
  CREDITS_UPDATED: 'credits_updated'
};
