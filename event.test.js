const EventManager = require('./ga-pubsub');

describe('GA-PubSub (Multi-Tenant Enhanced EventManager)', () => {
  let bus;

  beforeEach(() => {
    // isolate each test fully
    EventManager.resetAll?.();

    bus = EventManager.getEventingManagerInstance('test-tenant');
  });

  test('should subscribe to and publish an event', async () => {
    const callback = jest.fn();

    bus.subscribe('exampleEvent', callback);

    await bus.publish('exampleEvent', { key: 'value' });

    expect(callback).toHaveBeenCalledWith({ key: 'value' });
  });

  test('should handle multiple subscribers', async () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();

    bus.subscribe('multiEvent', cb1);
    bus.subscribe('multiEvent', cb2);

    await bus.publish('multiEvent', 'data');

    expect(cb1).toHaveBeenCalledWith('data');
    expect(cb2).toHaveBeenCalledWith('data');
  });

  test('should not leak events across tenants', async () => {
    const busA = EventManager.getEventingManagerInstance('A');
    const busB = EventManager.getEventingManagerInstance('B');

    const cbA = jest.fn();
    const cbB = jest.fn();

    busA.subscribe('event', cbA);
    busB.subscribe('event', cbB);

    await busA.publish('event', 'A-data');

    expect(cbA).toHaveBeenCalledWith('A-data');
    expect(cbB).not.toHaveBeenCalled();
  });

  test('should handle synchronous subscribers', async () => {
    const cb = jest.fn();

    bus.subscribe('syncEvent', cb);

    await bus.publish('syncEvent', 'sync-data');

    expect(cb).toHaveBeenCalledWith('sync-data');
  });

  test('should handle async subscribers safely', async () => {
    const asyncCb = jest.fn(async (data) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(`processed-${data}`), 20);
      });
    });

    bus.subscribe('asyncEvent', asyncCb);

    await bus.publish('asyncEvent', 'data');

    expect(asyncCb).toHaveBeenCalledWith('data');
  });

  test('should isolate errors between subscribers', async () => {
    const good = jest.fn();
    const bad = jest.fn(() => {
      throw new Error('failure');
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    bus.subscribe('errorEvent', bad);
    bus.subscribe('errorEvent', good);

    await bus.publish('errorEvent', 'data');

    expect(good).toHaveBeenCalledWith('data');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test('should unsubscribe a subscriber correctly', async () => {
    const cb = jest.fn();

    const { eventName, id } = bus.subscribe('removeEvent', cb);

    bus.unsubscribe(eventName, id);

    await bus.publish(eventName, 'data');

    expect(cb).not.toHaveBeenCalled();
  });

  test('should support subscribeOnce behavior', async () => {
    const cb = jest.fn();

    bus.subscribeOnce('onceEvent', cb);

    await bus.publish('onceEvent', 'first');
    await bus.publish('onceEvent', 'second');

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith('first');
  });

  test('should support wildcard events', async () => {
    const cb = jest.fn();

    bus.subscribe('user:*', cb);

    await bus.publish('user:created', { id: 1 });
    await bus.publish('user:deleted', { id: 2 });

    expect(cb).toHaveBeenCalledTimes(2);
  });

  test('should return correct subscriber count', () => {
    bus.subscribe('countEvent', jest.fn());
    bus.subscribe('countEvent', jest.fn());

    expect(bus.getSubscriberCount('countEvent')).toBe(2);
  });

  test('should return list of active events', () => {
    bus.subscribe('a', jest.fn());
    bus.subscribe('b', jest.fn());

    const events = bus.getEvents();

    expect(events).toContain('a');
    expect(events).toContain('b');
  });

  test('should unsubscribeEvent remove all listeners', async () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();

    bus.subscribe('bulkEvent', cb1);
    bus.subscribe('bulkEvent', cb2);

    bus.unsubscribeEvent('bulkEvent');

    await bus.publish('bulkEvent', 'data');

    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).not.toHaveBeenCalled();
  });

  test('should unsubscribeAll clear everything safely', async () => {
    const cb = jest.fn();

    bus.subscribe('x', cb);
    bus.subscribe('y', cb);

    bus.unsubscribeAll();

    await bus.publish('x', 'data');
    await bus.publish('y', 'data');

    expect(cb).not.toHaveBeenCalled();
  });

  test('should respect replay opt-out', () => {
    const cb = jest.fn();

    bus.publish('replayEvent', 'first');

    bus.subscribe('replayEvent', cb, { replay: false });

    expect(cb).not.toHaveBeenCalledWith('first');
  });

  test('should respect replay opt-out on subscribe', () => {
    const cb = jest.fn();

    bus.publish('replaySubscribeEvent', 'first');

    bus.subscribe('replaySubscribeEvent', cb, { replay: false });

    expect(cb).not.toHaveBeenCalledWith('first');
  });

  // [NEW TEST]: Testing the publish side of the relay feature
  test('should respect storeHistory opt-out on publish', async () => {
    const cb = jest.fn();

    // Publish an event but explicitly tell it NOT to store it for relay/history
    await bus.publish('noRelayEvent', 'secret-data', { storeHistory: false });

    // A late subscriber joins (with replay enabled by default)
    bus.subscribe('noRelayEvent', cb);

    // Callback should not fire because the event was never stored in history
    expect(cb).not.toHaveBeenCalled();
  });

  test('should process middleware payload transform and pipeline cancellation', async () => {
    bus.use((event, payload) => {
      if (payload.dropMe) return false; // Aborts propagation entirely
      return { ...payload, injectedKey: 'verified' }; // Transform
    });

    const outputCallback = jest.fn();
    bus.subscribe('middleware:test', outputCallback);

    await bus.publish('middleware:test', { value: 42 });
    expect(outputCallback).toHaveBeenCalledWith({ value: 42, injectedKey: 'verified' });

    await bus.publish('middleware:test', { dropMe: true });
    expect(outputCallback).toHaveBeenCalledTimes(1); // Dropped by middleware interceptor
  });

  test('should assert functional hierarchical wildcards (* and **)', async () => {
    const singleWildcardCallback = jest.fn();
    const deepWildcardCallback = jest.fn();

    bus.subscribe('store.*.billing', singleWildcardCallback);
    bus.subscribe('store.**', deepWildcardCallback);

    await bus.publish('store.us-east.billing', 'payload-1');
    await bus.publish('store.eu-west.checkout.billing', 'payload-2');

    expect(singleWildcardCallback).toHaveBeenCalledTimes(1); // Matches single level deep
    expect(deepWildcardCallback).toHaveBeenCalledTimes(2);   // Matches both multi-level chains
  });

  test('should process subscribers in order of execution priorities', async () => {
    const executionTraceOrder = [];

    bus.subscribe('priority:test', () => executionTraceOrder.push('low-priority'), { priority: -10 });
    bus.subscribe('priority:test', () => executionTraceOrder.push('high-priority'), { priority: 100 });
    bus.subscribe('priority:test', () => executionTraceOrder.push('default-priority')); // Implicit 0

    await bus.publish('priority:test', {});
    expect(executionTraceOrder).toEqual(['high-priority', 'default-priority', 'low-priority']);
  });

  test('should pipe runtime operational failures directly to explicit DLQ onError hook', async () => {
    const deadLetterQueueSpy = jest.fn();
    const runtimeBus = EventManager.getEventingManagerInstance('dlq-tenant', {
      onError: deadLetterQueueSpy
    });

    runtimeBus.subscribe('fail:event', () => {
      throw new Error('Database connection timed out');
    });

    await runtimeBus.publish('fail:event', { data: 'packet' });

    expect(deadLetterQueueSpy).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        phase: 'subscriber',
        eventName: 'fail:event',
        data: { data: 'packet' }
      })
    );
  });
});