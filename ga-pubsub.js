class EventingManagerService{constructor(){this.eventRegistry={};this.history={};this.counter=0}generate(prefix="id"){this.counter+=1;return`${prefix}_${this.counter}`}subscribe(eventName,someFunction){const id=this.generate();if(!this.eventRegistry[eventName]){this.eventRegistry[eventName]=[{id:id,func:someFunction,isAsync:someFunction.constructor.name==="AsyncFunction"}]}else{this.eventRegistry[eventName].push({id:id,func:someFunction,isAsync:someFunction.constructor.name==="AsyncFunction"})}const historyData=this.getHistory(eventName);if(historyData!==-1){someFunction(historyData)}return{eventName:eventName,id:id}}async publish(eventName,data){if(this.eventRegistry[eventName]){for(const listener of this.eventRegistry[eventName]){if(listener.func){if(listener.isAsync){try{if(this.eventRegistry[eventName].find(subscriber=>subscriber.id===listener.id)){await listener.func(data);this.history[eventName]=data}}catch(error){console.error(`Error handling event ${eventName}: ${error}`)}}else{if(this.eventRegistry[eventName].find(subscriber=>subscriber.id===listener.id)){listener.func(data);this.history[eventName]=data}}}}}else{this.history[eventName]=data}}async unsubscribe(eventName,id){if(this.eventRegistry[eventName]){this.eventRegistry[eventName]=await this.eventRegistry[eventName].filter(subscriber=>subscriber.id!==id)}delete this.history[eventName]}unsubscribeAll(){this.eventRegistry={}}getHistory(eventName){return this.history[eventName]||-1}}let sharedInstance;const getEventingManagerInstance=key=>{if(key==="pubsub"){if(!sharedInstance){sharedInstance=new EventingManagerService;globalThis.EventingManagerService=sharedInstance}return sharedInstance}else{return new EventingManagerService}};
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
      // AMD
      define(['exports'], factory);
  } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
      // CommonJS
      factory(exports);
  } else {
      // Global variable (root is window)
      factory(root.gaPubSub = {});
  }
}(this, function (exports) {
  exports.getEventingManagerInstance = getEventingManagerInstance;
  exports.EventingManagerService = EventingManagerService;
}));