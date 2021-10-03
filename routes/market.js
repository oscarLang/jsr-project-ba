var express = require('express');
var router = express.Router();
const objects = require("../models/objects");
const user = require("../models/user");
const auth = require("../models/auth");


router.post('/new',
(req, res, next) => auth.checkToken(req, res, next),
async function(req, res) {
    var result = await objects.insertObject(req.body.stock, req.body.name, req.body.startPrice, req.body.startQuantity,);
    return res.status(result.status).json(result);
});


router.get('/all', async function(req, res) {
    var result = await objects.getAllObjects();
    return res.status(result.status).json(result);
});

router.get('/:stock', async function(req, res) {
    let symbolOfStock = req.params.stock;
    let status = 200;
    var result = await objects.getOneObject(symbolOfStock);
    if (!result) {
        status = 404;
    }
    return res.status(status).json(result);
});

router.post('/buy', (req, res, next) => auth.checkToken(req, res, next), async function(req, res) {
    let email = req.email;
    let stock = req.body.stock;
    let amountNumber = Number(req.body.amount);
    let amount = (amountNumber < 0) ? (amountNumber * -1) : amountNumber;
    let oneObject = await objects.getOneObject(stock);
    let price = (oneObject.price < 0) ? (oneObject.price * -1) : oneObject.price;
    let totalPrice = (price * amount);
    let fundsOfUser = await user.getFunds(email);
    console.log(fundsOfUser);
    if (!oneObject) {
        return res.status(404).json({
            err: "No stock with that name found",
        });
    }
    if (fundsOfUser.funds < totalPrice) {
        return res.status(401).json({
            err: "Not enough funds",
        });
    }
    try {
        await objects.changeQuantityInMarket(stock, amount * -1);
    } catch (e) {
        console.log(e);
        return res.status(401).json({
            err: "error changing quantity in market"
        });
    }
    try {
        await user.changeUserStockAndFunds(email, stock, amount, (totalPrice * -1), price);
    } catch (e) {
        console.log(e);
        return res.status(401).json({
            err: "error changing user stock"
        });
    }
    return res.status(200).json({
        msg: "Stocks purchased"
    });
});

router.post('/sell', (req, res, next) => auth.checkToken(req, res, next), async function(req, res) {
    let email = req.email;
    let stock = req.body.stock;
    let amountNumber = Number(req.body.amount);
    let amount = (amountNumber < 0) ? (amountNumber * -1) : amountNumber;
    let oneObject = await objects.getOneObject(stock);
    let price = (oneObject.price < 0) ? (oneObject.price * -1) : oneObject.price;
    let totalPrice = (price * amount);
    let stocksOfUser = await user.getStocksOfUser(email);
    console.log(stocksOfUser);
    let stockToSell = stocksOfUser.stocks.find(({name}) => name === stock);

    if (stockToSell && (stockToSell.amount < amount)) {
        return res.status(404).json({
            err: "Not enough stocks",
        });
    }
    if (!email) {
        return res.status(404).json({
            err: "User not found",
        });
    }
    if (!oneObject) {
        return res.status(404).json({
            err: "No stock with that name found",
        });
    }
    try {
        await objects.changeQuantityInMarket(stock, amount);
    } catch (e) {
        console.log(e);
        return res.status(400).json({
            err: "error changing quantity in market"
        });
    }
    try {
        await user.changeUserStockAndFunds(email, stock, (amount * -1), totalPrice);
    } catch (e) {
        console.log(e);
        return res.status(400).json({
            err: "error changing user stock"
        });
    }
    return res.status(200).json({
        msg: "Stocks sold"
    });
});



module.exports = router;
