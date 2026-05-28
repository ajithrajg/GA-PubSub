# ga-pubsub

Lightweight, scalable, and TypeScript-first PubSub event manager for JavaScript applications.

Supports wildcard routing, middleware pipelines, replayable events, multi-tenant isolation, and priority-based subscriptions — all with zero dependencies.

---

# Installation

```bash
npm install ga-pubsub
```

---

# Quick Example

```ts
import { getEventingManagerInstance } from 'ga-pubsub';

type UserPayload = {
  id: number;
  name: string;
};

const bus = getEventingManagerInstance('app');

// Subscribe
bus.subscribe<UserPayload>(
  'user:created',
  (user) => {

    // IDE autocomplete supported
    console.log(user.id);
    console.log(user.name);
  }
);

// Publish
bus.publish<UserPayload>(
  'user:created',
  {
    id: 1,
    name: 'Ajith'
  }
);
```

---

# Why ga-pubsub?

| Feature | EventEmitter | ga-pubsub |
|---------|--------------|-----------|
| Wildcard Routing | ❌ | ✅ |
| Middleware Support | ❌ | ✅ |
| Event Replay | ❌ | ✅ |
| Priority Subscriptions | ❌ | ✅ |
| Multi-Tenant Isolation | ❌ | ✅ |
| TypeScript Generics | Limited | ✅ |
| Zero Dependencies | ✅ | ✅ |
| UMD Compatibility | ❌ | ✅ |

---

# Core Features

- Zero dependencies
- TypeScript-first API
- Generic payload support
- Multi-tenant event isolation
- Middleware interceptors
- Wildcard event routing
- Replayable event history
- Priority-based subscriber execution
- Global error handling (DLQ)
- Browser + Node.js support
- UMD architecture
- ES5 + CommonJS + ES Modules compatible

---

# Runtime Compatibility

`ga-pubsub` follows the UMD (Universal Module Definition) pattern, making it compatible across modern and legacy JavaScript environments.

| Environment | Supported |
|-------------|-----------|
| ES5 Browsers | ✅ |
| CommonJS | ✅ |
| ES Modules | ✅ |
| TypeScript | ✅ |
| Node.js | ✅ |
| Browser CDN Usage | ✅ |

---

# Architecture

```text
  Publisher
      │
      ▼
┌─────────────┐
│ ga-pubsub   │
└─────────────┘
│      │      │
▼      ▼      ▼
UI  Analytics Logger
```

---

# Getting Started

## CommonJS

```js
const { getEventingManagerInstance } = require('ga-pubsub');

const eventManager = getEventingManagerInstance('tenant-a');
```

## ES Modules

```js
import { getEventingManagerInstance } from 'ga-pubsub';

const eventManager = getEventingManagerInstance('tenant-a');
```

## TypeScript

```ts
import { getEventingManagerInstance } from 'ga-pubsub';

const eventManager = getEventingManagerInstance('tenant-a', {
  replayLimit: 10,

  onError: (error, context) => {
    console.error('DLQ Error:', error, context);
  }
});
```

---

# API Overview

## Core Methods

| Method | Description |
|--------|-------------|
| `publish(event, payload, options?)` | Publish an event |
| `subscribe(event, callback, options?)` | Subscribe to an event |
| `subscribeOnce(event, callback, options?)` | Subscribe once and auto-remove |
| `unsubscribe(event, id)` | Remove a subscriber |
| `unsubscribeEvent(event)` | Remove all subscribers for an event |
| `unsubscribeAll()` | Clear entire event bus |
| `destroy()` | Destroy current event manager instance |

## Advanced Methods

| Method | Description |
|--------|-------------|
| `use(middleware)` | Register middleware |
| `getHistory(event)` | Access replay history |

---

# Publishing Events

```ts
eventManager.publish('user:created', {
  id: 1,
  name: 'Ajith'
});
```

## Transient Events

Skip history storage for high-frequency events.

```ts
eventManager.publish(
  'mouse:move',
  { x: 100, y: 200 },
  { storeHistory: false }
);
```

---

# Subscribing to Events

```ts
const subscriber = eventManager.subscribe(
  'user:created',
  (data) => {
    console.log(data);
  }
);
```

---

# One-Time Subscriptions

Useful for initialization flows or single-use listeners.

```ts
eventManager.subscribeOnce(
  'app:initialized',
  (payload) => {
    console.log('Initialized:', payload);
  }
);
```

---

# Priority Subscriptions

Higher priority subscribers execute first.

```ts
eventManager.subscribe(
  'user:created',
  analyticsHandler,
  { priority: 100 }
);

eventManager.subscribe(
  'user:created',
  uiHandler,
  { priority: 10 }
);
```

---

# Wildcard Routing

## Single-Level Wildcard (`*`)

Matches exactly one segment.

```ts
eventManager.subscribe(
  'user.*.updated',
  callback
);
```

Matches:

```txt
user.profile.updated
user.account.updated
```

Does NOT match:

```txt
user.profile.password.updated
```

---

## Multi-Level Wildcard (`**`)

Matches zero or more segments.

```ts
eventManager.subscribe(
  'store.**',
  callback
);
```

Matches:

```txt
store.open
store.us.billing
store.us.checkout.success
```

---

# Middleware

Middleware runs before subscribers receive events.

Useful for:

- validation
- logging
- payload mutation
- filtering

```ts
eventManager.use((eventName, payload) => {

  // Drop event
  if (payload.isSpam) {
    return false;
  }

  // Mutate payload
  return {
    ...payload,
    timestamp: Date.now()
  };
});
```

---

# Event Replay

Late subscribers can replay historical events.

```ts
// Published earlier
eventManager.publish('config:loaded', {
  theme: 'dark'
});

// Subscriber joins later
eventManager.subscribe(
  'config:loaded',
  (config) => {
    console.log(config.theme);
  }
);
```

---

# Unsubscribing

## Remove Specific Subscriber

```ts
eventManager.unsubscribe(
  subscriber.eventName,
  subscriber.id
);
```

## Remove All Subscribers for an Event

```ts
eventManager.unsubscribeEvent('user:created');
```

## Clear Entire Event Bus

```ts
eventManager.unsubscribeAll();
```

---

# Destroy Event Manager Instance

Useful during testing or application teardown.

```ts
eventManager.destroy();
```

---

# Event Naming Best Practices

## Recommended Format

Use hierarchical naming:

```txt
user:created
user:auth:login
store.us.checkout
```

---

## Rules

- Event names must be strings
- Event names are case-sensitive
- Wildcards are only valid in subscriptions
- Use delimiters like `:` or `.`

---

# Migration Guide (v1.1.1 → Latest)

Most existing code remains compatible.

However, wildcard behavior changed from greedy matching to structural matching.

---

## Old Behavior

```ts
bus.subscribe('user:*', callback);
```

Previously matched everything downstream.

---

## New Equivalent

```ts
bus.subscribe('user:**', callback);
```

Matches:

```txt
user:created
user:auth:login
user:auth:password:reset
```

---

## New Precise Matching

```ts
bus.subscribe('user:*:status', callback);
```

Matches:

```txt
user:admin:status
```

Does NOT match:

```txt
user:admin:super:status
```

---

# Performance

Designed for low-overhead event dispatching.

## Highlights

- Zero runtime dependencies
- Optimized dispatch pipeline
- Lightweight architecture
- Minimal memory overhead

---

# Documentation & Playground

Official Documentation & Interactive Playground:

https://deslay-ai.web.app/ga-pubsub

---

# License

MIT License

See `LICENSE.md` for details.

---

# Author

**Ajithraj G**