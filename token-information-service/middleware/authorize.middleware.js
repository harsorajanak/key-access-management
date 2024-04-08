const jwt = require('jsonwebtoken');
const client = require("../services/grpc.service");
const { JWT_SECRET } = require("../config");



module.exports = {
    // authorize request with rate limiter as per plan
    Authorise: (req, res, next) => {
        const authorization = req.get('Authorization')
        if(!authorization){
            res.status(401).send({
                status: false,
                message: 'access token not found'
            })
        }
        try {
            client.Authorise({ accessToken: authorization }, (err, response) => {
                if (err) return res.status(401).send({status: false, message: err.message});

                const decoded = jwt.verify(authorization, JWT_SECRET);
                req.tokenInformation  = decoded;
                
                next()
            });
        
        } catch(err) {
            res.status(401).send({
                status: false,
                message: err.message
            })
        }
        
    },
    // validate user request and get access token 
    Authenticate: (req, res, next) => {
        const xApiKey = req.get('X-API-KEY')
        if(!xApiKey){
            res.status(401).send({
                status: false,
                message: 'access key not found'
            })
        }
        try {
            client.GetAccessToken({ accessKey: xApiKey }, (err, response) => {
                if (err) return res.status(401).send({status: false, message: "please enter valid access key"})

                return res.status(401).send({
                    status: true,
                    accessToken: response?.accessToken
                })
            });
        
        } catch(err) {
            res.status(401).send({
                status: false,
                message: err
            })
        }
        
    }
};