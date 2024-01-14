<h2>About</h2>

A <b>lightweight</b> and <b>flexible PubSub</b> (Publish-Subscribe) event manager for <b>JavaScript environments</b>. This package <b>enables seamless communication</b> between different parts of your application by allowing components to subscribe to specific events and react accordingly when those events are published.

<h2>Installation</h2>

To install the PubSub Eventing Manager, use the following npm command:

**npm install ga-pubsub**

<h2>Support</h2>

This package follows **event-driven architecture**, utilizes the **UMD pattern**, and is **compatible** with **both CommonJS and ES6 Modules**.

<h2>Getting Started</h2>

To initialize the event manager, use the provided function getEventingManagerInstance and pass the argument 'pubsub'. This ensures **a singleton instance of the Eventing Manager** is created and shared across your application.

CommonJS:
```
const { getEventingManagerInstance } = require('ga-pubsub');

// Initialize the event manager
const eventManager = getEventingManagerInstance('pubsub');
```

ES6:
```
import { getEventingManagerInstance } from 'ga-pubsub';

// Initialize the event manager
const eventManager = getEventingManagerInstance('pubsub');
```

Typescript:
```
import { getEventingManagerInstance } from 'ga-pubsub';

// Initialize the event manager
private eventManager = getEventingManagerInstance('pubsub');
```

<h2>Usage</h2>

<h2>Subscribing to events</h2>
Subscribing to events by providing an event name and a callback function. The callback function will be invoked whenever the specified event is published.

CommonJS:
```
const callback = (data) => {
  // Handle the event data
  console.log('Event received:', data);
};

// Subscribe to an event
eventManager.subscribe('exampleEvent', callback);
```

ES6:
```
const callback = (data) => {
  // Handle the event data
  console.log('Event received:', data);
};

// Subscribe to an event
eventManager.subscribe('exampleEvent', callback);
```

Typescript:
```
private callback = (data: any) => {
  // Handle the event data
  console.log('Event received:', data);
};

// Subscribe to an event
this.eventManager.subscribe('exampleEvent', this.callback);
```

<h2>Publishing Events</h2>
Publish events with associated data. Subscribed functions will be called with the provided data when the event is published.

CommonJS:
```
const eventData = { 'key': 'value' };

// Publish an event
eventManager.publish('exampleEvent', eventData);
```

ES6:
```
// Publish an event
const eventData = { 'key': 'value' };

this.eventManager.publish('exampleEvent', eventData);
```

Typescript:
```
// Publish an event
const eventData = { 'key': 'value' };

this.eventManager.publish('exampleEvent', eventData);
```

<h2>Unsubscribing from an event</h2>
Unsubscribe from specific events or remove all subscriptions.

CommonJS:
```
const subscriber = eventManager.subscribe('exampleEvent', callback);

// Unsubscribe from a specific event
await eventManager.unsubscribe(subscriber.eventName, subscriber.id);

// Unsubscribe from all events
eventManager.unsubscribeAll();
```

ES6:
```
const subscriber = eventManager.subscribe('exampleEvent', callback);

// Unsubscribe from a specific event
await this.eventManager.unsubscribe(subscriber.eventName, subscriber.id);

// Unsubscribe from all events
this.eventManager.unsubscribeAll();
```

Typescript:
```
const subscriber = eventManager.subscribe('exampleEvent', callback);

// Unsubscribe from a specific event
await eventManager.unsubscribe(subscriber.eventName, subscriber.id);

// Unsubscribe from all events
eventManager.unsubscribeAll();
```

<h2>Subscribe to an event at ANYTIME</h2>

CommonJS:
```
const eventName = 'testEvent';
const eventData = 'Test data';
    
function callback(data) {
    console.log('Event received:', data);
}

// Publish event
eventManager.publish(eventName, eventData);

const subscriber = eventManager.subscribe(eventName, callback);
```

ES6:
```
const eventName = 'testEvent';
const eventData = 'Test data';
    
function callback(data) {
    console.log('Event received:', data);
}

// Publish event
eventManager.publish(eventName, eventData);

const subscriber = eventManager.subscribe(eventName, callback);
```

Typescript:
```
const eventName = 'testEvent';
const eventData = 'Test data';
    
private callback = (data: any) => {
    console.log('Event received:', data);
}

// Publish event
this.eventManager.publish(eventName, eventData);

const subscriber = this.eventManager.subscribe(eventName, this.callback);
```

<h2>Sample Code to Get Started</h2>

CommonJS:
```
const { getEventingManagerInstance } = require('ga-pubsub');

// Initialize the event manager
let eventManager = getEventingManagerInstance('pubsub');
let subscriberList = [];

const callback_1 = (data) => {
  // Handle the event data
  console.log('Event received:', data);
};

// Subscribe to an event
addSubscriber('exampleEvent', callback_1);

// Publish an event
const eventData = { 'key': 'value' };
eventManager.publish('exampleEvent', eventData);

const callback_2 = (data) => {
  // Handle the event data
  console.log('Event received:', data);
};

// Subscribe to an event at anytime
addSubscriber('exampleEvent', callback_2);

function addSubscriber(eventName, callback) {
  const subscriber = eventManager.subscribe(eventName, callback);
  this.subscriberList.push(subscriber);
}

// Unsubscribe after completion 
this.subscriberList.forEach(subscriber => {
  eventManager.unsubscribe(subscriber.eventName, subscriber.id);
})

```

ES6:
```
import { getEventingManagerInstance } from 'ga-pubsub';

// Initialize the event manager
const eventManager = getEventingManagerInstance('pubsub');
let subscriberList = [];

const callback_1 = (data) => {
  // Handle the event data
  console.log('Event received:', data);
};

// Subscribe to an event
addSubscriber('exampleEvent', callback_1);

// Publish an event
const eventData = { 'key': 'value' };
eventManager.publish('exampleEvent', eventData);

const callback_2 = (data) => {
  // Handle the event data
  console.log('Event received:', data);
};

// Subscribe to an event at any time
addSubscriber('exampleEvent', callback_2);

function addSubscriber(eventName, callback) {
  const subscriber = eventManager.subscribe(eventName, callback);
  subscriberList.push(subscriber);
}

// Unsubscribe after completion 
subscriberList.forEach(subscriber => {
  eventManager.unsubscribe(subscriber.eventName, subscriber.id);
});
```

ES6:
```
import { getEventingManagerInstance } from 'ga-pubsub';

// Initialize the event manager
const eventManager = getEventingManagerInstance('pubsub');
let subscriberList = [];

const callback_1 = (data) => {
  // Handle the event data
  console.log('Event received:', data);
};

// Subscribe to an event
addSubscriber('exampleEvent', callback_1);

// Publish an event
const eventData = { 'key': 'value' };
eventManager.publish('exampleEvent', eventData);

const callback_2 = (data) => {
  // Handle the event data
  console.log('Event received:', data);
};

// Subscribe to an event at any time
addSubscriber('exampleEvent', callback_2);

function addSubscriber(eventName, callback) {
  const subscriber = eventManager.subscribe(eventName, callback);
  subscriberList.push(subscriber);
}

// Unsubscribe after completion 
subscriberList.forEach(subscriber => {
  eventManager.unsubscribe(subscriber.eventName, subscriber.id);
});
```

Typescript:
```
private eventManager = getEventingManagerInstance('pubsub');
private subscriberList: any[] = [];

ngOnInit() {
  this.subscribeToEvent('exampleEvent', this.handleEvent1);

  const eventData = { 'key': 'value' };
  this.eventManager.publish('exampleEvent', eventData);

  this.subscribeToEvent('exampleEvent', this.handleEvent2);
}

ngOnDestroy() {
  this.unsubscribeAll();
}

private handleEvent1(data:any) {
  console.log('Event received:', data);
}

private handleEvent2(data:any) {
  console.log('Event received:', data);
}

private subscribeToEvent(eventName:string, callback:any) {
  const subscriber = this.eventManager.subscribe(eventName, callback);
  this.subscriberList.push(subscriber);
}

private unsubscribeAll() {
  this.subscriberList.forEach((subscriber:any) => {
    this.eventManager.unsubscribe(subscriber.eventName, subscriber.id);
  });
}
```
<h2>License</h2>
This package is licensed under the MIT License - see the LICENSE.md file for details.


<h2>Author</h2>

[**Ajithraj G**][npmsite] and his [Official site][website]


[website]: https://ajithraj-g.web.app
[npmsite]: https://www.npmjs.com/~ajithraj-g

