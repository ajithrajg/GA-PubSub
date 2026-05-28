/**
 * GA-PubSub - Multi-tenant Event System
 * Supports isolated namespaces, middleware execution, priority queues, and advanced wildcards.
 */

function matchEventPattern(pattern, eventName) {
    if (!pattern.includes('*')) return pattern === eventName;
    
    // Normalize and convert standard structural wildcards into safe regular expressions
    const regexStr = '^' + pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex control tokens except asterisk
        .replace(/\\\*/g, '*')                 // Restore asterisks back to literal symbols
        .replace(/\*\*/g, '___DOUBLE_WILD___') // Placeholder multi-level
        .replace(/\*/g, '___SINGLE_WILD___')   // Placeholder single-level
        .replace(/___DOUBLE_WILD___/g, '.*')    // Match everything structural
        .replace(/___SINGLE_WILD___/g, '[^.:]+') + '$'; // Match single segment only
        
    return new RegExp(regexStr).test(eventName);
}

class EventingManagerService {
    constructor(options = {}) {
        this.eventRegistry = new Map();
        this.history = new Map();
        this.counter = 0;
        this.middlewares = [];

        this.options = {
            replayLimit: options.replayLimit || 1,
            historyTTL: options.historyTTL || 0,
            enableWildcard: options.enableWildcard ?? true,
            onError: options.onError || null,
        };
    }

    generate(prefix = "id") {
        this.counter += 1;
        return `${prefix}_${this.counter}`;
    }

    use(middlewareFn) {
        if (typeof middlewareFn !== "function") {
            throw new Error("Middleware must be a function");
        }
        this.middlewares.push(middlewareFn);
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
            priority: options.priority || 0,
        };

        if (!this.eventRegistry.has(eventName)) {
            this.eventRegistry.set(eventName, new Map());
        }

        this.eventRegistry.get(eventName).set(id, subscriber);

        if (options.replay !== false) {
            const historyData = this.getHistory(eventName);

            if (historyData.length > 0) {
                historyData.forEach((item) => {
                    try {
                        callback(item.data);
                    } catch (err) {
                        this.handleError(err, {
                            eventName,
                            data: item.data,
                            phase: 'replay',
                            subscriberId: id
                        });
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

    async publish(eventName, data, options = {}) {
        let currentData = data;

        // 1. Process Middleware Interceptor Chain
        for (const middleware of this.middlewares) {
            try {
                const result = await Promise.resolve(middleware(eventName, currentData));
                if (result === false) return; // Middleware aborted execution pipeline safely
                if (result !== undefined) {
                    currentData = result; // Interceptor mutated data payload
                }
            } catch (err) {
                this.handleError(err, { eventName, data: currentData, phase: 'middleware' });
                return;
            }
        }

        // 2. Manage History Registries
        const storeHistory = options.storeHistory !== false;
        if (storeHistory) {
            this.storeHistory(eventName, currentData);
        }

        // 3. Resolve and Sort Subscribers by Priority Grouping
        const listeners = this.getMatchingSubscribers(eventName);
        if (listeners.length === 0) return;

        // 4. Sequential Execution Loop to strict-honor Subscriber Prioritization order
        for (const { subscriber, subscribedEvent } of listeners) {
            try {
                if (subscriber.once) {
                    this.unsubscribe(subscribedEvent, subscriber.id);
                }
                await Promise.resolve(subscriber.callback(currentData));
            } catch (err) {
                this.handleError(err, {
                    eventName,
                    data: currentData,
                    subscriberId: subscriber.id,
                    phase: 'subscriber'
                });
            }
        }
    }

    getMatchingSubscribers(eventName) {
        const listeners = [];

        for (const [registeredEvent, subscribers] of this.eventRegistry.entries()) {
            let isMatch = registeredEvent === eventName;

            if (!isMatch && this.options.enableWildcard) {
                isMatch = matchEventPattern(registeredEvent, eventName);
            }

            if (isMatch) {
                for (const subscriber of subscribers.values()) {
                    listeners.push({
                        subscribedEvent: registeredEvent,
                        subscriber,
                    });
                }
            }
        }

        // Higher sorting scalar values bubble up to run first
        return listeners.sort((a, b) => b.subscriber.priority - a.subscriber.priority);
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

    handleError(error, context) {
        if (typeof this.options.onError === 'function') {
            try {
                this.options.onError(error, context);
            } catch (fallbackErr) {
                console.error('[PubSub] Hook Crash:', fallbackErr);
                console.error('[PubSub] Intercepted Base System Error:', error, context);
            }
        } else {
            console.error(`[PubSub] Unhandled exception occurred in context: [${context.phase}]`, error);
        }
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
        this.middlewares = [];
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

function resetNamespace(namespace) {
    registry.delete(namespace);
}

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