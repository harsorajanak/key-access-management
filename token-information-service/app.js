const express = require("express")
const app = express()
var methodOverride = require("method-override")

// parsing body request
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))

// include router
const routes = require("./routes/index")

// routing
app.use("/", routes)

// starting server
app.listen(5000, function() {
  console.log("server listening on port 5000")
})