declare class EventingManagerService {
    private eventRegistry;
    private history;
    private counter;
    private options;

    constructor(options?: {
        replayLimit?: number;
        historyTTL?: number;
        enableWildcard?: boolean;
    });

    generate(prefix?: string): string;

    subscribe(
        eventName: string,
        callback: (data: any) => void,
        options?: {
            once?: boolean;
            replay?: boolean;
        }
    ): { id: string; eventName: string };

    subscribeOnce(
        eventName: string,
        callback: (data: any) => void,
        options?: {
            replay?: boolean;
        }
    ): { id: string; eventName: string };

    publish(eventName: string, data: any): Promise<void>;

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
    }
): EventingManagerService;

/**
 * Test / dev utilities
 */
declare function resetNamespace(namespace: string): void;

declare function resetAll(): void;

export {
    EventingManagerService,
    getEventingManagerInstance,
    resetNamespace,
    resetAll
};