var startOfMinute = require('date-fns/startOfMinute');
var startOfHour = require('date-fns/startOfHour');
var startOfDay = require('date-fns/startOfDay');
var subMinutes = require('date-fns/subMinutes');
var format = require('date-fns/format');
var faker = require('faker');

const objects = require("./models/objects");
const user = require("./models/user");
const mongo = require("mongodb").MongoClient;
const dsn = "mongodb://192.168.1.65:27017";
let dbName = 'project';
const existingTickers = [];
(async function(){
    const client  = await mongo.connect(dsn);
    const db = await client.db(dbName);
    db.dropDatabase();
    await user.insertUser("test@test.com", "pass");

    const now = new Date();


    for (let j = 0; j < 5; j++) {
        const companyName = faker.company.companyName();
        const ticker = generateTicker(companyName);
        const catchPhrase = faker.company.catchPhrase();
        const ceo = faker.name.firstName() + " " + faker.name.lastName();
        const startPrice = getRandomInt(20, 200);
        const startAmount = getRandomInt(100000, 1000000000000);
        const volatility = (Math.random() * (0.0050 - 0.0005) + 0.0005);
        const history = generateHistory(now, startPrice, volatility);
        await objects.insertObject(
            ticker,
            companyName,
            ceo,
            catchPhrase,
            startPrice,
            startAmount,
            volatility,
            history);
    }
    await client.close();

})();


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}


function generateTicker(companyName) {
    let ticker = "";
    while (!ticker || existingTickers.includes(ticker)) {
        let chars = companyName.match(/[A-Z]/g);
        ticker = chars.join("");
    }
    return ticker;
}

function generateHistory(initDate, initPrice, volatility) {
    var price = initPrice;
    const minutly = [];
    const hourly = [];
    const daily = [];
    for(let i = 0; i < 43200 ; i++) {
        price = getNewPrice(price, volatility);
        const date = subMinutes(initDate, i);
        if (i < 1440) {
            const minutlyDate = startOfMinute(date);
            minutly.push({
                date: minutlyDate,
                formatedDate: format(minutlyDate, "yyyy/MM/dd-HH:mm"),
                price: price});
        }
        if (i % 60 === 0) {
            const hourlyDate = startOfHour(date);
            hourly.push({
                formatedDate: format(hourlyDate, "yyyy/MM/dd-HH:mm"),
                date: hourlyDate,
                price: price});
        }
        if (i % 1440 === 0 ) {
            const dailyDate = startOfDay(date);
            daily.push({
                formatedDate: format(dailyDate, "yyyy/MM/dd-HH:mm"),
                date: dailyDate,
                price: price});
        }

    }
    return {minutly: minutly, hourly: hourly, daily: daily};
}

function getNewPrice(price, volatility) {
    const random = Math.random();
    let changeInPercent = (2 * volatility * random);
    if (changeInPercent > volatility) {
        changeInPercent -= (2 * volatility);
    }
    let newPrice = price + (price * changeInPercent);
    return parseFloat(newPrice).toFixed(2);
}
