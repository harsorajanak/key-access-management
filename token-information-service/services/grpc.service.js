const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { join } = require("path");

// loading grpc from proto file
var packageDefinition = protoLoader.loadSync(join(__dirname, '../protos/keys.proto'), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

// load package definition grpc
const KeyManagementService = grpc.loadPackageDefinition(packageDefinition).keyManagement.KeyManagementService;
// connect grpc client 
const client = new KeyManagementService(
    "localhost:5051",
    grpc.credentials.createInsecure()
);

module.exports = client;