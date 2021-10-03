const mongo = require("mongodb").MongoClient;
const dsn =  "mongodb://localhost:27017";
let dbName = 'project';
if (process.env.NODE_ENV === 'test') {
    dbName = 'test';
}

async function insertObject(stock, name, startPrice, startQuantity, rate, variance) {
    let now = new Date();
    let obj = {
        stock: stock,
        name: name,
        price: startPrice,
        quantity: startQuantity,
        rate: rate,
        variance: variance,
        history: [
            {
                price: startPrice,
                time: now
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

async function getAllObjects() {
    const client  = await mongo.connect(dsn);
    const db = await client.db(dbName);
    const col = await db.collection('objects');
    const res = await col.find().toArray();
    console.log(res);
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
    // getAmountAvailableOfStock: getAmountAvailableOfStock,
    changeQuantityInMarket:changeQuantityInMarket,
    getOneObject: getOneObject
};
