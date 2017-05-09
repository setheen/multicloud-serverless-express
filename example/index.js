const express = require("express");
const app = express();
const cloudBoiler = require("./dist/index.js").default;

app.get("/test1", (req, res) =>
{
    res.json({some: "value"});
});

app.get("/test2/deeper/:part", (req, res) =>
{
    res.send(`You sent ${req.params.part}`);
});

cloudBoiler.ignite(app);

exports.test = (firstParam, secondParam) => cloudBoiler.boil(firstParam, secondParam);