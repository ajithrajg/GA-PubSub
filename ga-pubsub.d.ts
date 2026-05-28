export interface EventContext<T = any> {
    eventName: string;
    data: T;
    phase: 'middleware' | 'subscriber' | 'replay';
    subscriberId?: string;
}

export type MiddlewareFn<T = any> = (eventName: string, data: T) => any | Promise<any> | false;

declare class EventingManagerService {
    private eventRegistry;
    private history;
    private counter;
    private options;
    private middlewares;

    constructor(options?: {
        replayLimit?: number;
        historyTTL?: number;
        enableWildcard?: boolean;
        onError?: (error: Error, context: EventContext) => void;
    });

    generate(prefix?: string): string;

    use<T = any>(middlewareFn: MiddlewareFn<T>): void;

    subscribe<T = any>(
        eventName: string,
        callback: (data: T) => void,
        options?: {
            once?: boolean;
            replay?: boolean;
            priority?: number;
        }
    ): { id: string; eventName: string };

    subscribeOnce<T = any>(
        eventName: string,
        callback: (data: T) => void,
        options?: {
            replay?: boolean;
            priority?: number;
        }
    ): { id: string; eventName: string };

    publish<T = any>(
        eventName: string,
        data: T,
        options?: {
            storeHistory?: boolean;
        }
    ): Promise<void>;

    unsubscribe(eventName: string, id: string): boolean;
    unsubscribeEvent(eventName: string): void;
    unsubscribeAll(): void;
    getHistory(eventName: string): Array<{ data: any; timestamp: number }>;
    getSubscriberCount(eventName: string): number;
    getEvents(): string[];
    destroy(): void;
}

/**
 * Multi-tenant instance getter
 */
declare function getEventingManagerInstance(
    namespace?: string,
    options?: {
        replayLimit?: number;
        historyTTL?: number;
        enableWildcard?: boolean;
        onError?: (error: Error, context: EventContext) => void;
    }
): EventingManagerService;

declare function resetNamespace(namespace: string): void;
declare function resetAll(): void;

export {
    EventingManagerService,
    getEventingManagerInstance,
    resetNamespace,
    resetAll
};