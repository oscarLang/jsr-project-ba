var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    const data = {
        data: {
            msg: `My name is Oscar and this is my backend API for the course jsramverk. In this course we will take a deeper look at the Big Three framworks for javascript development aswell as some other technologies.`
        }
    };

    res.json(data);
});

module.exports = router;
