const { status } = require("@grpc/grpc-js");

module.exports = {
  // get token information by access token
  getTokenInformation: function(req, res) {
    res.status(200).json({
      status: true,
      data: req?.tokenInformation
    });
  },
}