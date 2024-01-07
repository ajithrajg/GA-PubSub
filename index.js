const EventManager = require('./EventManager/event');

let eventManager;

eventManager = EventManager.getEventingManagerInstance('pubsub');

const eventName = 'unsubscribeEvent';
function mockSubscriber() {
    console.log('callback executed');
}

function mockSubscriber1() {
    console.log('callback1 executed');
}

funct();

async function funct() {
    const eventName = 'testEvent';
    const eventData = 'Test data';
    
    const callback = mockSubscriber;
    eventManager.subscribe(eventName, mockSubscriber1);

    // Publish event
    eventManager.publish(eventName, eventData);

    eventManager.subscribe(eventName, mockSubscriber);

    // Ensure the callback is called with the correct data
}