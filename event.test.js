// event.test.js
const EventManager = require('./EventManager/event');

describe('EventManager', () => {
  let eventManager;

  beforeEach(() => {
    eventManager = EventManager.getEventingManagerInstance('pubsub');
  });

  test('should subscribe to and publish an event', () => {
    // Arrange
    const callback = jest.fn();
    const eventData = { 'test_event': 'test_value' };

    // Act
    eventManager.subscribe('exampleEvent', callback);
    eventManager.publish('exampleEvent', eventData);

    // Assert
    expect(callback).toHaveBeenCalledWith(eventData);
  });

  test('should handle multiple subscribers', () => {
    // Arrange
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const eventData = { 'test_event': 'test_value' };

    // Act
    eventManager.subscribe('exampleEvent', callback1);
    eventManager.subscribe('exampleEvent', callback2);
    eventManager.publish('exampleEvent', eventData);

    // Assert
    expect(callback1).toHaveBeenCalledWith(eventData);
    expect(callback2).toHaveBeenCalledWith(eventData);
  });

  test('should not call subscribers for unregistered events', () => {
    // Arrange
    const callback = jest.fn();

    // Act
    eventManager.subscribe('registeredEvent', callback);
    eventManager.publish('unregisteredEvent', {});

    // Assert
    expect(callback).not.toHaveBeenCalled();
  });
});
