<h2>About</h2>

A <b>lightweight</b> and <b>flexible PubSub</b> (Publish-Subscribe) event manager for <b>JavaScript environments</b>. This package <b>enables seamless communication</b> between different parts of your application by allowing components to subscribe to specific events and react accordingly when those events are published.

<h2>Installation</h2>

To install the PubSub Eventing Manager, use the following npm command:

**npm install ga-pubsub**


<h2>Getting Started</h2>

To initialize the event manager, use the provided function getEventingManagerInstance and pass the argument 'pubsub'. This ensures **a singleton instance of the Eventing Manager** is created and shared across your application.

```
const { getEventingManagerInstance } = require('ga-pubsub');

// Initialize the event manager
let eventManager = getEventingManagerInstance('pubsub');
```

<h2>Usage</h2>

<h2>Subscribing to events</h2>
Subscribing to events by providing an event name and a callback function. The callback function will be invoked whenever the specified event is published.

```
const callback = (data) => {
  // Handle the event data
  console.log('Event received:', data);
};

// Subscribe to an event
eventManager.subscribe('exampleEvent', callback);
```

<h2>Publishing Events</h2>
Publish events with associated data. Subscribed functions will be called with the provided data when the event is published.

```
const eventData = { 'key': 'value' };

// Publish an event
eventManager.publish('exampleEvent', eventData);
```

<h2>Unsubscribing from an event</h2>
Unsubscribe from specific events or remove all subscriptions.

```
const id = eventManager.subscribe('exampleEvent', callback);
// Unsubscribe from a specific event
eventManager.unsubscribe('exampleEvent', id);

// Unsubscribe from all events
eventManager.unsubscribeAll();
```

<h2>Example - Best Practises</h2>

```
const { getEventingManagerInstance } = require('ga-pubsub');

// Initialize the event manager
let eventManager = getEventingManagerInstance('pubsub');

// Subscribe to an event
const id_1 = eventManager.subscribe('exampleEvent', callback_1);

const callback_1 = (data) => {
  // Handle the event data
  console.log('Event received:', data);
  eventManager.unsubscribe('exampleEvent', id_1);
};

// Publish an event
const eventData = { 'key': 'value' };
eventManager.publish('exampleEvent', eventData);

// Subscribe to an event at anytime
const id_2 = eventManager.subscribe('exampleEvent', callback_2);

const callback_2 = (data) => {
  // Handle the event data
  console.log('Event received:', data);
  eventManager.unsubscribe('exampleEvent', id_2);
};
```

<h2>License</h2>
This package is licensed under the MIT License - see the LICENSE.md file for details.


<h2>Author</h2>

[**Ajithraj G**][npmsite] and his [Official site][website]


[website]: https://ajithraj-g.web.app
[npmsite]: https://www.npmjs.com/~ajithraj-g

