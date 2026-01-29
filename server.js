// require() → Node.js function used to import built-in modules
const http = require("http")

// require() → imports the File System module
const fs = require("fs")

// Constant variable to store the data file name
const DATA_FILE = "data.json"

// http.createServer() → creates an HTTP server instance
const server = http.createServer((req, res) => {

    // req.method → property that tells the HTTP method (GET, POST, etc.)
    // req.url → property that tells the requested route
    if (req.method === "GET" && req.url === "/kgl/procurement") {

        // fs.readFile() → reads the contents of a file asynchronously
        fs.readFile(DATA_FILE, "utf8", (err, data) => {

            // if statement → checks if an error occurred
            if (err) {
                // res.writeHead() → sets HTTP status code and headers
                res.writeHead(500, { "Content-Type": "application/json" })

                // res.end() → ends the response and sends data to client
                return res.end(JSON.stringify({ message: "Failed to read data" }))
            }

            // res.writeHead() → sends HTTP 200 OK status
            res.writeHead(200, { "Content-Type": "application/json" })

            // res.end() → sends the response body and closes the response
            res.end(data)
        })
    }

    // else if → checks another condition if the first is false
    else if (req.method === "POST" && req.url === "/kgl/procurement") {

        // let body → variable to collect incoming request data
        let body = ""

        // req.on() → event listener for streaming request data
        req.on("data", chunk => {
            // toString() → converts Buffer data to string
            body += chunk.toString()
        })

        // req.on("end") → event fired when all data has been received
        req.on("end", () => {

            // JSON.parse() → converts JSON string into JavaScript object
            try {
                body = JSON.parse(body)
            } catch (error) {
                // res.writeHead() → sends HTTP 400 Bad Request
                res.writeHead(400, { "Content-Type": "application/json" })

                // res.end() → sends error message
                return res.end(JSON.stringify({ message: "Invalid JSON format" }))
            }

            // Logical OR (||) → checks if required fields are missing
            if (!body.item || !body.quantity) {
                // res.writeHead() → sends HTTP 400 status
                res.writeHead(400, { "Content-Type": "application/json" })

                // res.end() → sends validation error message
                return res.end(JSON.stringify({ message: "Missing required fields" }))
            }

            // fs.readFile() → reads existing procurement data from file
            fs.readFile(DATA_FILE, "utf8", (err, data) => {

                // Array → stores procurement records
                let records = []

                // if statement → checks if file was read successfully
                if (!err) {
                    try {
                        // JSON.parse() → converts stored JSON data to array
                        records = JSON.parse(data)
                    } catch {
                        // Reset array if JSON is corrupted
                        records = []
                    }
                }

                // Array.push() → adds new procurement record to array
                records.push(body)

                // fs.writeFile() → writes updated data back to the file
                fs.writeFile(
                    DATA_FILE,
                    // JSON.stringify() → converts JS object to JSON string
                    // null, 2 → formats JSON for readability
                    JSON.stringify(records, null, 2),
                    err => {

                        // if statement → checks for write error
                        if (err) {
                            // res.writeHead() → sends HTTP 500 error
                            res.writeHead(500, { "Content-Type": "application/json" })

                            // res.end() → sends failure message
                            res.end(JSON.stringify({ message: "Failed to save data" }))
                        } else {
                            // res.writeHead() → sends HTTP 201 Created
                            res.writeHead(201, { "Content-Type": "application/json" })

                            // res.end() → sends success response
                            res.end(JSON.stringify({
                                message: "Procurement added successfully",
                                data: body
                            }))
                        }
                    }
                )
            })
        })
    }

    // else → executes when no route matches
    else {
        // res.writeHead() → sends HTTP 404 Not Found
        res.writeHead(404, { "Content-Type": "application/json" })

        // res.end() → sends route not found message
        res.end(JSON.stringify({ message: "Route not found" }))
    }
})

// server.listen() → starts the server on the specified port
server.listen(3000, () => {
    // console.log() → prints message to terminal
    console.log("The http Server is running on port 3000")
})
