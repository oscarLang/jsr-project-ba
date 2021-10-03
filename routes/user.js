var express = require('express');
var router = express.Router();
const userModel = require("../models/user");
const auth = require("../models/auth");
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

router.post('/register', async function(req, res) {
    var email = req.body.email;
    var plainPass = req.body.password;
    if (!email || !plainPass) {
        return res.status(401).json({
            data: {
                msg: "Register failed, all fields must be filled"
            }
        });
    }

    insert = await userModel.insertUser(email, plainPass);
    return res.status(insert.status).json(insert);
});

router.post('/deposit',
(req, res, next) => auth.checkToken(req, res, next),
async function(req, res) {

    var email = req.email;
    var amount = req.body.amount;
    if (!email || !amount) {
        return res.status(401).json({
            data: {
                msg: "Deposit failed, all fields must be filled"
            }
        });
    }

    var result = await userModel.deposit(email, amount);
    return res.status(result.status).json(result);
});

router.get('/funds',
(req, res, next) => auth.checkToken(req, res, next),
async function(req, res) {
    var email = req.email;
    if (!email) {
        return res.status(401).json({
            data: {
                msg: "You need to login first"
            }
        });
    }

    var result = await userModel.getFunds(email);
    return res.status(result.status).json(result);
});

router.get('/stocks',
(req, res, next) => auth.checkToken(req, res, next),
async function(req, res) {
    var email = req.email;
    if (!email) {
        return res.status(401).json({
            data: {
                msg: "You need to login first"
            }
        });
    }

    var result = await userModel.getStocksOfUser(email);

    return res.status(result.status).json(result);
});

router.get('/stocks/:name',
(req, res, next) => auth.checkToken(req, res, next),
async function(req, res) {
    var email = req.email;
    let nameOfStock = req.params.name;
    if (!email) {
        return res.status(401).json({
            data: {
                msg: "You need to login first"
            }
        });
    }
    var all = await userModel.getStocksOfUser(email);
    var specific = all.stocks.find(({name}) => name === nameOfStock);
    return res.status(all.status).json(specific);
});

router.post('/login', async function(req, res) {
    var email = req.body.email;
    var plainPass = req.body.password;
    if (!email || !plainPass) {
        return res.status(401).json({
            data: {
                msg: "Login failed, all fields must be filled"
            }
        });
    }

    const succes = await userModel.authenticateUser(email, plainPass);
    if (succes.err) {
        if (succes.status === 404) {
            return res.status(404).json({
                res: "User not found",
            });
        }
        return res.status(500).json({
            res: "Login failed with error",
        });
    } else if (!succes.result && !succes.err) {
        return res.status(401).json({
            res: "Password not a match",
        });
    } else {
        let payload = { email: email };
        let token = jwt.sign(payload, secret, { expiresIn: '12h'});
        let cookieSettings = {maxAge: 604800000};
        if (process.env.NODE_ENV === 'production') {
            cookieSettings.secure = true;
            cookieSettings.domain = ".oscarlang.me";
        }
        return res.status(200).cookie('jwt', token, cookieSettings).send("OK");
    }
});

module.exports = router;
