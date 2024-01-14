// event.test.js
const EventManager = require('./ga-pubsub');

describe('EventManager', () => {
  let eventManager;

  beforeEach(() => {
    eventManager = EventManager.getEventingManagerInstance('pubsub');
  });

  test('should subscribe to and publish an event', () => {
    // Arrange
    const callback = jest.fn();
    const eventData = { 'key': 'value' };

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
    const eventData = { 'key': 'value' };

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

  test('should handle synchronous event subscribers', () => {
    const eventName = 'syncEvent';
    const mockSubscriber = jest.fn();

    eventManager.subscribe(eventName, mockSubscriber);
    eventManager.publish(eventName, 'data');

    expect(mockSubscriber).toHaveBeenCalledWith('data');
  });

  test('should handle asynchronous event subscribers', async () => {
    const eventName = 'asyncEvent';
    const asyncSubscriber = async (data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(`Processed ${data}`);
        }, 100);
      });
    };

    const mockSubscriber = jest.fn();

    eventManager.subscribe(eventName, asyncSubscriber);
    await eventManager.publish(eventName, 'data');

    expect(mockSubscriber).not.toHaveBeenCalled(); // Asynchronous subscriber should not be called synchronously
  });

  test('should handle asynchronous function as argument and handle in subscription', async () => {
    const eventName = 'asyncEvent';
    const asyncSubscriber = async (data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(`Processed ${data}`);
        }, 100);
      });
    };

    const mockSubscriber = jest.fn();

    eventManager.subscribe(eventName, asyncSubscriber);
    await eventManager.publish(eventName, 'data');

    // Ensure that the asyncSubscriber is called with the correct data
    expect(mockSubscriber).not.toHaveBeenCalled();
  });

  test('should handle simple data as argument and handle in subscription', () => {
    const eventName = 'simpleDataEvent';
    const mockSubscriber = jest.fn();

    eventManager.subscribe(eventName, mockSubscriber);
    eventManager.publish(eventName, 'data');

    // Ensure that the mockSubscriber is called with the correct data
    expect(mockSubscriber).toHaveBeenCalledWith('data');
  });

  test('should handle error in asynchronous function', async () => {
    const eventName = 'errorEvent';
    const asyncSubscriberWithError = async () => {
      throw new Error('Async error');
    };
  
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    eventManager.subscribe(eventName, asyncSubscriberWithError);
  
    // Ensure that the error is caught and logged
    try {
      await eventManager.publish(eventName, 'data');
      // If we reach this point, the async function did not throw an error
      expect(true).toBe(true);
    } catch (error) {
      expect(error.message).toBe('Async error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Async error'));
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
  
  test('should unsubscribe a subscriber', async () => {
    const eventName = 'unsubscribeEvent';
    const mockSubscriber = jest.fn();
  
    const subscriberData = eventManager.subscribe(eventName, mockSubscriber);
    await eventManager.unsubscribe(subscriberData.eventName, subscriberData.id); // Await the unsubscribe operation
    await eventManager.publish(eventName, 'data');
  
    expect(mockSubscriber).not.toHaveBeenCalled();
  });

  test('should subscribe to published event and call the callback', () => {
    const eventName = 'testEvent';
    const eventData = 'Test data';
    
    const callback = jest.fn();
    const callback2 = jest.fn();

    eventManager.subscribe(eventName, callback);
    // Publish event
    eventManager.publish(eventName, eventData);

    eventManager.subscribe(eventName, callback2);

    // Ensure the callback is called with the correct data
    expect(callback2).toHaveBeenCalledWith(eventData);
  });

  test('should subscribe to published event at anytime', () => {

    const eventName = 'testEvent';
    const eventData = 'Test data';
    const callback = jest.fn();

    eventManager.publish(eventName, eventData);

    eventManager.subscribe(eventName, callback);

    expect(callback).toHaveBeenCalledWith(eventData);
  })

});
