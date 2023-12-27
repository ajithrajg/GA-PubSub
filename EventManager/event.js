class EventingManagerService {
    constructor() {
      this.eventRegistry = {};
    }
  
    subscribe(eventName, someFunction) {
        if (!this.eventRegistry[eventName]) {
          this.eventRegistry[eventName] = [{ func: someFunction, isAsync: someFunction.constructor.name === 'AsyncFunction' }];
        } else {
          this.eventRegistry[eventName].push({ func: someFunction, isAsync: someFunction.constructor.name === 'AsyncFunction' });
        }
    }

    async publish(eventName, data) {
        if (this.eventRegistry[eventName]) {
          for (const listener of this.eventRegistry[eventName]) {
            if (listener.isAsync) {
              // Handling asynchronous functions using await
              try {
                await listener.func(data);
              } catch (error) {
                console.error(`Error handling event ${eventName}: ${error}`);
              }
            } else {
              // Handling synchronous functions
              listener.func(data);
            }
          }
        }
      }
    
  
    unsubscribeAll() {
      this.eventRegistry = {};
    }
  
    unsubscribe(eventName, someFunction) {
      if (this.eventRegistry[eventName]) {
        this.eventRegistry[eventName] = this.eventRegistry[eventName].filter((func) => func !== someFunction);
      }
    }
  }
  
  let sharedInstance;
  
  const getEventingManagerInstance = (key) => {
    if (key === 'pubsub') {
      if (!sharedInstance) {
        sharedInstance = new EventingManagerService();
        global.EventingManagerService = sharedInstance;
      }
      return sharedInstance;
    } else {
      return new EventingManagerService();
    }
  };

  module.exports = { getEventingManagerInstance, EventingManagerService };

  