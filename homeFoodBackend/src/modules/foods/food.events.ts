import EventEmitter from "events";

class FoodEvents extends EventEmitter {}

const foodEvents = new FoodEvents();

export default foodEvents;
