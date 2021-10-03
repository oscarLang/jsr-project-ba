const mongo = require("mongodb").MongoClient;
const dsn =  "mongodb://localhost:27017";
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const saltRounds = 10;
const secret = process.env.JWT_SECRET;

let dbName = 'project';
if (process.env.NODE_ENV === 'test') {
    dbName = 'test';
}

async function insertUser(email, plainPass) {
    const hashedPassword = await bcrypt.hash(plainPass, saltRounds)
    if (hashedPassword) {
        var user = {
            email: email,
            password: hashedPassword,
            stocks: []
        };
        const client  = await mongo.connect(dsn);
        const db = await client.db(dbName);
        const col = await db.collection('users');
        const res = await col.insertOne(user);

        await client.close();
        return {
            res: res,
            status: 201,
        };
    }
    return {
        res: "Insertion failed",
        status: 500
    };
}

async function findOneUserByEmail(client, email) {
    const db = await client.db(dbName);
    const col = await db.collection('users');
    const user = await col.findOne({email: email});
    return user;
}

async function authenticateUser(email, plain) {
    const client  = await mongo.connect(dsn);
    const user = await findOneUserByEmail(client, email);
    await client.close();
    if (user) {
        const isSame = await bcrypt.compare(plain, user.password);
        if (isSame) {
            return {
                err: false,
                status: 200,
                result: isSame
            };
        } else {
            return {
                err: false,
                status: 401,
                result: isSame
            };
        }
    } else {
        return {
            err: "no user",
            status: 404,
            result: false
        };
    }
}

async function deposit(email, amount) {
    let res = {
        msg: "balance updated",
        status: 201
    };
    const amountInteger = Number(amount);
    const client  = await mongo.connect(dsn);
    const db = await client.db(dbName);
    const col = await db.collection('users');
    var updated = await col.updateOne({email: email}, { $inc: { balance: amountInteger }});
    if (updated.matchedCount == 0) {
        res = {
            msg: "Insertion failed",
            status: 500
        };
    }
    await client.close();
    return res;
}

async function getFunds(email) {
    let res = {
        msg: "Funds",
        status: 200
    };
    const client  = await mongo.connect(dsn);
    const user = await findOneUserByEmail(client, email);
    if (!user) {
        res.msg = "No user found";
        res.status = 404;
    } else {
        res.funds = user.balance;
    }
    await client.close();
    return res;
}

async function getStocksOfUser(email) {
    let res = {
        msg: "Stocks",
        status: 200
    };
    const client  = await mongo.connect(dsn);
    const user = await findOneUserByEmail(client, email);
    if (!user) {
        res.msg = "No user found";
        res.status = 404;
    } else {
        res.stocks = user.stocks.filter(stock => stock.amount > 0);
    }
    await client.close();
    return res;
}

async function changeUserStockAndFunds(email, stock, amount, totalPrice, price=0) {
    // @amount must be integer
    const client  = await mongo.connect(dsn);
    const db = await client.db(dbName);
    const col = await db.collection('users');
    const updated = await col.updateOne(
        {
            email: email
        },
        {
            $inc: {
                balance: totalPrice,
            }
        });
    if (updated.matchedCount == 0) {
        throw "No user found with that email";
    }
    const addStockName = await col.updateOne(
        {
            email: email,
            'stocks.name': {$ne : stock}
        },
        {
            $addToSet: {
                stocks: {
                    name: stock,
                    amount: 0,
                    buyPrice: 0
                },
            },
        });

    const stockAmountChanged = await col.updateOne(
        {
            email: email,
            'stocks.name': stock
        },
        {
            $inc: {
                'stocks.$.amount': amount
            }
        }
    );
    if (stockAmountChanged.matchedCount == 0) {
        throw "Update of amount failed";
    }
    if (price > 0) {
        const setBuyPrice = await col.updateOne(
            {
                email: email,
                'stocks.name': stock
            },
            {
                $set: {
                    'stocks.$.buyPrice': price
                }
            }
        );
        if (setBuyPrice.matchedCount == 0) {
            throw "Update of amount failed";
        }
    }
}

module.exports = {
    insertUser: insertUser,
    authenticateUser: authenticateUser,
    deposit: deposit,
    getFunds: getFunds,
    getStocksOfUser: getStocksOfUser,
    changeUserStockAndFunds: changeUserStockAndFunds,
};
