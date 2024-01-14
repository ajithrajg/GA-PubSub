declare class EventingManagerService {
    private eventRegistry;
    private history;
    private counter;

    constructor();

    generate(prefix?: string): string;

    subscribe(eventName: string, someFunction: (data: any) => void): { eventName: string, id: string };

    publish(eventName: string, data: any): Promise<void>;

    unsubscribe(eventName: string, id: string): Promise<void>;

    unsubscribeAll(): void;

    getHistory(eventName: string): any;
}

declare const getEventingManagerInstance: (key: string) => EventingManagerService;

export { EventingManagerService, getEventingManagerInstance };
