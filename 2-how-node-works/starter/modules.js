// module.exports
const C = require("./test-module-1");

const calc1 = new C();
console.log(calc1.add(2, 5));

// exports
// const calc2 = require("./test-module-2");
const { divide } = require("./test-module-2");
console.log({ ...{} });

console.log(divide(2, 10));

require("./test-module-3")();
require("./test-module-3")();
require("./test-module-3")();
