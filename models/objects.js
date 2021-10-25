const mongo = require("mongodb").MongoClient;
var getYear = require('date-fns/getYear');
var getMonth = require('date-fns/getMonth');
var getDay = require('date-fns/getDay');
var getMinutes = require('date-fns/getMinutes');
var getHours = require('date-fns/getHours');
var format = require('date-fns/format');
const dsn =  "mongodb://localhost:27017";
let dbName = 'project';
if (process.env.NODE_ENV === 'test') {
    dbName = 'test';
}

async function insertObject(stock, name, startPrice, startQuantity, rate, variance) {
    const date = new Date();
    const formatedDate = format(date, "yyyy/MM/dd-HH:mm");
    const year = getYear(date);
    const month = getMonth(date);
    const day = getDay(date);
    const hour = getHours(date);
    const minute = getMinutes(date);
    let obj = {
        stock: stock,
        name: name,
        price: startPrice,
        quantity: startQuantity,
        rate: rate,
        variance: variance,
        minutly: [
            {
                price: startPrice,
                date: formatedDate
            }
        ],
        hourly: [
            {
                price: startPrice,
                date: formatedDate
            }
        ],
        daily: [
            {
                price: startPrice,
                date: formatedDate
            }
        ]
    };
    const client  = await mongo.connect(dsn);
    const db = await client.db(dbName);
    const col = await db.collection('objects');
    const res = await col.insertOne(obj);
    await client.close();
    if (res) {
        return {
            res: "New object inserted",
            status: 201
        };
    }
    return {
        res: "Insertion failed",
        status: 500
    };
}

async function getObjectsIn(email) {
    const client  = await mongo.connect(dsn);
    const db = await client.db(dbName);
    const col = await db.collection('users');
    const user = await col.findOne({email: email});
    const userStocks = user.stocks;
    
    const objCol = await db.collection('objects');
    const res = await objCol.find({stock: { $in: userStocks.map(stock => stock.name)}})
    .map((stock) => {
        const stockWithName = userStocks.find((s) =>s.name = stock.name);
        return {...stock, ...stockWithName};
    })
    .toArray();
    return res;
}

async function getAllObjects() {
    const client  = await mongo.connect(dsn);
    const db = await client.db(dbName);
    const col = await db.collection('objects');
    const res = await col.find().toArray();
    await client.close();
    if (res) {
        return {
            status: 200,
            res
        };
    } else {
        return {
            res: "No objects found",
            status: 404,
            data: {}
        };
    }
}

async function changeQuantityInMarket(stock, amount) {
    // @amount must be integer
    // if buying, there has to be enough stocks available
    // if selling, must be more than 0
    let condition = (amount < 0) ? (amount * -1) : 0;
    const client  = await mongo.connect(dsn);
    const db = await client.db(dbName);
    const col = await db.collection('objects');
    const updated = await col.updateOne({stock: stock, quantity:{ $gt: condition}}, {
        $inc: {
            quantity: amount
        }
    });
    if (updated.matchedCount == 0) {
        throw "No values updated";
    }
}

async function getOneObject(stock) {
    const client  = await mongo.connect(dsn);
    const db = await client.db(dbName);
    const col = await db.collection('objects');
    const res = await col.findOne({stock: stock});
    return res;
}


module.exports = {
    insertObject: insertObject,
    getAllObjects: getAllObjects,
    getObjectsIn: getObjectsIn,
    changeQuantityInMarket:changeQuantityInMarket,
    getOneObject: getOneObject
};
