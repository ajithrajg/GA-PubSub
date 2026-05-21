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
});