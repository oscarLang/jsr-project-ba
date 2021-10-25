var subMinutes = require('date-fns/subMinutes');
var format = require('date-fns/format');

const objects = require("./models/objects");
const user = require("./models/user");
const mongo = require("mongodb").MongoClient;
const dsn = "mongodb://localhost:27017";
let dbName = 'project';
(async function(){
    const client  = await mongo.connect(dsn);
    const db = await client.db(dbName);
    db.dropDatabase();
    const now = new Date();

    await user.insertUser("test@test.com", "pass")
    await objects.insertObject("ABB", "Test", 42, 32, 1.00001, 0.5);
    const {minutly, hourly, daily} = generateHistory();
    console.log(daily);
    //await objects.insertObject("BOB", "Test2", 58, 200, 1.000001, 0.2);
    //await objects.insertObject("LUL", "Japp", 13, 900, 1.000001, 0.4);
    //await objects.insertObject("HST", "Hest", 6, 23, 1.000001, 0.6);
    await client.close();

})();


function generateHistory(initDate, initPrice, rate, variance) {
    var price = initPrice;
    const minutly = [];
    const hourly = [];
    const daily = [];
    for(let i; i < 43200 ; i++) {
        price = getNewPrice(price, rate, variance);
        const date = subMinutes(initDate, i);
        const formatedDate = format(date, "yyyy/MM/dd-HH:mm");
        minutly.push({date: formatedDate, price: price});
        if (i % 60 === 0) {
            hourly.push({date: formatedDate, price: price});
        }
        if (i % 1440 === 0 ) {
            daily.push({date: formatedDate, price: price});
        }

    }
    return {minutly: minutly, hourly: hourly, daily: daily};
}

function getNewPrice(price, rate, variance) {
    let trend = (Math.random() > 0.5) ? 1 : -1;
    if (price < 1) {
        trend = 1;
    }
    let newPrice = (price * rate) + (variance * trend);
    return newPrice.toFixed(2);
}

