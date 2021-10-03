const objects = require("./models/objects");
const user = require("./models/user");
(async function(){
    await user.insertUser("test@test.com", "pass")
    await objects.insertObject("ABB", "Test", 42, 32, 1.00001, 0.5);
    await objects.insertObject("BOB", "Test2", 58, 200, 1.000001, 0.2);
    await objects.insertObject("LUL", "Japp", 13, 900, 1.000001, 0.4);
    await objects.insertObject("HST", "Hest", 6, 23, 1.000001, 0.6);
    console.log(await objects.getAllObjects());
})();
