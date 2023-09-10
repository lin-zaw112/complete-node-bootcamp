const http = require("http");
const fs = require("fs");
const url = require("url");
const slugify = require("slugify");
// SERVER
const replaceTemplate = require("./modules/replaceTemplate");

// ! preloading the data
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const DataObj = JSON.parse(data);
// ! preReading the templates
const cardTemplate = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const overviewTemplate = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const productTemplate = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);

const slugs = DataObj.map((item) => slugify(item.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // *  Overview page
  if (pathname === "/overview" || pathname == "/") {
    const cardHtml = DataObj.map((item) => replaceTemplate(cardTemplate, item));
    const output = overviewTemplate.replace(
      "{%PRODUCT_CARDS%}",
      cardHtml.join("")
    );
    res.writeHead(200, {
      "Content-Type": "text/html",
    });

    res.end(output);
  }
  // * Product page
  else if (pathname === "/product") {
    const product = DataObj[query.id - 1];
    const output = replaceTemplate(productTemplate, product);
    res.writeHead(200, {
      "Content-Type": "text/html",
    });

    res.end(output);
  }
  // * API page
  else if (pathname === "/api") {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });
    res.end(data);
  } else {
    res.writeHead(404, {
      "Content-Type": "text/html",
    });
    res.end("<h1>Page not Found !</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000,\nhttp://127.0.0.1:8000");
});
