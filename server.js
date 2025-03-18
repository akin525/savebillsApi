// server.js

const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const http = require("http");
const WebSocket = require("ws");
const webb=require("./app/controllers/websoccket.controller");
const jwt = require("jsonwebtoken");

// Initialize Express app
const app = express();

app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
    cookieSession({
        name: "bezkoder-session",
        secret: process.env.COOKIE_SECRET || "default_secret", // should use as secret environment variable
        httpOnly: true,
        sameSite: 'strict'
    })
);

// database
const db = require("./app/models");
const config = require("./app/config/auth.config");
const Role = db.role;
const User = db.user;

db.sequelize.sync();
// force: true will drop the table if it already exists
// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Database with { force: true }');
//   initial();
// });

// simple route
app.get("/", (req, res) => {
    // Define your HTML content with CSS styles
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Savebills</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          text-align: center;
          padding-top: 50px;
        }
        .message {
          font-size: 24px;
          color: #333;
        }
      </style>
    </head>
    <body>
      <div>
        <h1>SAVEBILLS JWT BACKEND</h1>
        <img width="200" src="https://admin.savebills.com.ng/static/media/lg.ded7938f7b7bdd344a7a.png" alt=""/>
        <p class="message">Service Running For Api Users.....</p>
      </div>
    </body>
    </html>
  `;

    // Set the content type to HTML
    res.setHeader('Content-Type', 'text/html');

    // Send the HTML content as the response
    res.send(htmlContent);
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

// Create HTTP server and initialize WebSocket server
const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// const clients = {};

// Handle connection
// wss.on('connection', (ws, req) => {
//     // Extract token from query parameters
//     const token = new URLSearchParams(req.url.split('?')[1]).get('token');
//
//     if (!token) {
//         ws.send(JSON.stringify({
//             status: 0,
//             message: "No token provided!",
//         }));
//         ws.close();
//         return;
//     }
//
//     jwt.verify(token, config.secret, async (err, decoded) => {
//         if (err) {
//             ws.send(JSON.stringify({
//                 status: 0,
//                 message: "Unauthorized!",
//             }));
//             ws.close();
//             return;
//         }
//
//         const userId = decoded.id;
//         const user = await User.findOne({ where: { id: userId } });
//
//         if (!user) {
//             ws.send(JSON.stringify({
//                 status: 0,
//                 message: "User not found!",
//             }));
//             ws.close();
//             return;
//         }
//
//         ws.id = user.email;
//         clients[ws.id] = ws;
//         clients[ws.id].userDetails = user;
//
//         console.log(`New connection: ${ws.id}`);
//         Object.keys(clients).forEach(client => {
//             clients[client].send(JSON.stringify({
//                 clients: Object.keys(clients),
//                 details: JSON.parse(clients)
//             }));
//         });
//
//         // Log the IDs for easier tracking
//         console.log('Connected clients:', Object.keys(clients));
//
//         // Handle incoming messages
//         ws.on('message', async (message) => {
//             console.log(`Received message from ${ws.id}: ${message}`);
//             let data;
//
//             try {
//                 data = JSON.parse(message);
//             } catch (error) {
//                 console.error('Error parsing JSON:', error);
//                 return;
//             }
//
//             if (data.typing) {
//                 // Broadcast typing status to all clients except the sender
//                 Object.keys(clients).forEach((clientId) => {
//                     if (clients[clientId] !== ws) {
//                         clients[clientId].send(JSON.stringify({
//                             typing: data.typing,
//                             from: ws.id,
//                         }));
//                     }
//                 });
//             } else {
//                 // Save the message to the database
//                 await db.message.create({
//                     senderId: ws.id,
//                     recipientId: data.recipientId,
//                     content: data.content,
//                 });
//
//                 // Broadcast the message to the recipient client
//                 if (clients[data.recipientId]) {
//                     clients[data.recipientId].send(JSON.stringify({
//                         from: ws.id,
//                         content: data.content,
//                         timestamp: new Date(),
//                     }));
//                 }
//             }
//         });
//
//         // Handle connection close
//         ws.on('close', () => {
//             console.log(`Connection closed: ${ws.id}`);
//             delete clients[ws.id];
//             Object.keys(clients).forEach(client => {
//                 clients[client].send(JSON.stringify({
//                     clients: Object.keys(clients),
//                 }));
//             });
//         });
//     });
// });

// Set port and listen for requests
const PORT = process.env.PORT || 8080;
const david= server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
webb(david);
function initial() {
    Role.create({
        id: 1,
        name: "user",
    });

    Role.create({
        id: 2,
        name: "moderator",
    });

    Role.create({
        id: 3,
        name: "admin",
    });
}
