import EventEmitter from "events";

class OrderEvents extends EventEmitter {}

const orderEvents = new OrderEvents();

export default orderEvents;