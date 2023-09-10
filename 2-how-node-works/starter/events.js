const EventEmitter = require("events");

class Sales extends EventEmitter {
    constructor() {
        super();
    }
}
const myEmitter = new Sales();

myEmitter.on("newSale", () => {
    console.log("There was a new Sale !");
});
myEmitter.on("newSale", () => {
    console.log("Costumer name is John");
});
myEmitter.on("newSale", (stock) => {
    console.log(`There are now ${stock} items left in stock.`);
});
myEmitter.emit("newSale", 9);
