/**
 * GA-PubSub - Multi-tenant Event System
 * Supports isolated namespaces (tenant-based event buses)
 */

class EventingManagerService {
    constructor(options = {}) {
        this.eventRegistry = new Map();
        this.history = new Map();
        this.counter = 0;

        this.options = {
            replayLimit: options.replayLimit || 1,
            historyTTL: options.historyTTL || 0,
            enableWildcard: options.enableWildcard ?? true,
        };
    }

    generate(prefix = "id") {
        this.counter += 1;
        return `${prefix}_${this.counter}`;
    }

    subscribe(eventName, callback, options = {}) {
        if (typeof callback !== "function") {
            throw new Error("Callback must be a function");
        }

        const id = this.generate();

        const subscriber = {
            id,
            callback,
            once: options.once || false,
        };

        if (!this.eventRegistry.has(eventName)) {
            this.eventRegistry.set(eventName, new Map());
        }

        this.eventRegistry.get(eventName).set(id, subscriber);

        // replay support
        if (options.replay !== false) {
            const historyData = this.getHistory(eventName);

            if (historyData.length > 0) {
                historyData.forEach((item) => {
                    try {
                        callback(item.data);
                    } catch (err) {
                        console.error(`[PubSub] Replay error for "${eventName}":`, err);
                    }
                });
            }
        }

        return { id, eventName };
    }

    subscribeOnce(eventName, callback, options = {}) {
        return this.subscribe(eventName, callback, {
            ...options,
            once: true,
        });
    }

    async publish(eventName, data) {
        this.storeHistory(eventName, data);

        const listeners = [...this.getMatchingSubscribers(eventName)];

        if (listeners.length === 0) return;

        await Promise.allSettled(
            listeners.map(async ({ subscriber, subscribedEvent }) => {
                try {
                    await Promise.resolve(subscriber.callback(data));

                    if (subscriber.once) {
                        this.unsubscribe(subscribedEvent, subscriber.id);
                    }
                } catch (err) {
                    console.error(`[PubSub] Error in "${eventName}" subscriber:`, err);
                }
            })
        );
    }

    getMatchingSubscribers(eventName) {
        const listeners = [];

        for (const [registeredEvent, subscribers] of this.eventRegistry.entries()) {
            const isExact = registeredEvent === eventName;

            const isWildcard =
                this.options.enableWildcard &&
                registeredEvent.endsWith("*") &&
                eventName.startsWith(registeredEvent.slice(0, -1));

            if (isExact || isWildcard) {
                for (const subscriber of subscribers.values()) {
                    listeners.push({
                        subscribedEvent: registeredEvent,
                        subscriber,
                    });
                }
            }
        }

        return listeners;
    }

    storeHistory(eventName, data) {
        const now = Date.now();

        if (!this.history.has(eventName)) {
            this.history.set(eventName, []);
        }

        const historyItems = this.history.get(eventName);

        historyItems.push({ data, timestamp: now });

        if (historyItems.length > this.options.replayLimit) {
            historyItems.shift();
        }
    }

    getHistory(eventName) {
        if (!this.history.has(eventName)) return [];

        const items = this.history.get(eventName);

        if (this.options.historyTTL > 0) {
            const now = Date.now();

            const validItems = items.filter(
                (item) => now - item.timestamp <= this.options.historyTTL
            );

            this.history.set(eventName, validItems);

            return validItems;
        }

        return items;
    }

    unsubscribe(eventName, id) {
        const subscribers = this.eventRegistry.get(eventName);

        if (!subscribers) return false;

        const removed = subscribers.delete(id);

        if (subscribers.size === 0) {
            this.eventRegistry.delete(eventName);
        }

        return removed;
    }

    unsubscribeEvent(eventName) {
        this.eventRegistry.delete(eventName);
        this.history.delete(eventName);
    }

    unsubscribeAll() {
        this.eventRegistry.clear();
        this.history.clear();
    }

    getSubscriberCount(eventName) {
        return this.eventRegistry.get(eventName)?.size || 0;
    }

    getEvents() {
        return [...this.eventRegistry.keys()];
    }

    destroy() {
        this.unsubscribeAll();
    }
}

/**
 * -----------------------------
 * 🥉 MULTI-TENANT REGISTRY
 * -----------------------------
 */

const registry = new Map();

/**
 * Get isolated event bus per namespace
 */
function getEventingManagerInstance(namespace = "default", options = {}) {
    if (!registry.has(namespace)) {
        registry.set(namespace, new EventingManagerService(options));
    }

    return registry.get(namespace);
}

/**
 * Reset a single namespace (useful for tests)
 */
function resetNamespace(namespace) {
    registry.delete(namespace);
}

/**
 * Reset everything (dev/test only)
 */
function resetAll() {
    registry.clear();
}

/**
 * -----------------------------
 * UMD EXPORT
 * -----------------------------
 */
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports === "object" && typeof exports.nodeName !== "string") {
        factory(exports);
    } else {
        factory((root.gaPubSub = {}));
    }
})(typeof self !== "undefined" ? self : this, function (exports) {
    exports.EventingManagerService = EventingManagerService;
    exports.getEventingManagerInstance = getEventingManagerInstance;
    exports.resetNamespace = resetNamespace;
    exports.resetAll = resetAll;
});