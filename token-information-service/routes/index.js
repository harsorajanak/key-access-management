const express = require("express")
const tokenInformationController = require("../controllers/tokenInformation.controller")
const { Authorise, Authenticate } = require("../middleware/authorize.middleware")
const router = express.Router()

// get access token by using accesKey
router.get("/get-token", Authenticate)

// get token information using access token
router.get("/get-token-information", Authorise, tokenInformationController.getTokenInformation)

module.exports = router