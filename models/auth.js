const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;


function checkToken(req, res, next) {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({
            data: {
                msg: "No token specified"
            }
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
        if (err) {
            return res.status(401).json({
                data: {
                    msg: "Jwt verification failed",
                    err: err
                }
            });
        }
        console.log(decoded);
        req.email = decoded.email;
        next();
    });
}


module.exports = {
    checkToken: checkToken
};
