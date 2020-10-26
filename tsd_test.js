"use strict";
const app = require("express")();
const https = require("https")
const cookieParser = require('cookie-parser');
const request = require("request");
const moment = require("moment");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const User = require("./tsdtest/user.js");
const db = require("/home/tsdtest/db_dbpizza.js");
const session = require("express-session");

const port = 3030;

app.use(cookieParser());
app.use(
    cors({
        origin: ["http://localhost:8080", , "http://test.ddm24.ru", "https://test.ddm24.ru"],
        credentials: true
    })
);
app.use(
    session({
        secret: "sdlfjljrowuroweu",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    })
);
app.use(bodyParser.json());
app.post("/register", async function (request, response) {
    const regData = request.body
    const result = await User.newUser(regData)
    return response.send(result);
})
app.post("/login", async function (request, response) {
    const loginData = request.body
    const result = await User.userLogin(loginData)
    if (result.fuser) result.history = await User.getOrders(result.fuser.id)
    return response.send(result);
});
app.get("/login", async function (request, response) {
    let result = {}
    const auth = request.headers.authorization
    if (auth) result = await User.autoLogin(auth)
    result.history = await User.getOrders(result.fuser.id)
    return response.send(result);
});
app.post("/neworder", async function (request, response) {

    const orderData = request.body
    const auth = request.headers.authorization
    if (auth) orderData.auth = auth
    const result = await User.newOrder(orderData)
    return response.send(result);
});
app.get("/goods", async function (request, response) {
    const goods = await User.Goods()
    response.send(goods);
});
var server = https.createServer({
    key: fs.readFileSync('/etc/nginx/ssl/ibook_pivko24_ru.key'),
    cert: fs.readFileSync('/etc/nginx/ssl/ibook_pivko24_ru.full.crt'),
    requestCert: false,
    rejectUnauthorized: false
}, app)
server.listen(port, function () { });



