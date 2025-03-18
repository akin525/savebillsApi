const db = require("../models");
const Developer =db.user;
const Chat =db.message;
const  jwt = require('jsonwebtoken');
const ws = require('ws');
const fs = require('fs');
const config = require("../config/auth.config");
const res = require("express/lib/response");
const User=db.user;

const { JWT_SECRET } = process.env;

async function websocket (server) {
    console.log(`Hello, !`);
    const verifyToken = (token, secret, ws) => {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, decoded) => {
                if (err) {
                   // return "ukn: "

                }
                resolve(decoded);
            });
        });
    };
    function notifyAboutOnlinePeople(){
        [...wss.clients]
            .forEach(client => {
                client.send(JSON.stringify({
                    "event": "online-people",
                    "data": [...wss.clients].map(c => c.userdetails),
                    }
                ));
            });
    }
    var wss = new ws.WebSocketServer({server});
    wss.on('connection',async function (connection,req) {

        console.log("samson coming");


        console.log("moving");
        connection.isAlive = true;
        connection.timer = setInterval(()=>{
            connection.ping();
            connection.deathTimer = setTimeout(() => {
                connection.isAlive = false;
                clearInterval();
                connection.terminate();
                notifyAboutOnlinePeople();
                console.log("dead");
            },5000)
        }, 10000);

        console.log("continue");
        connection.on('pong', () => {
            clearTimeout(connection.deathTimer);
            console.log('pong');
        });

        const token = new URLSearchParams(req.url.split('?')[1]).get('token');
        console.log(token);
        // const decode = jwt.verify(token, config.secret);
        // if (err) {
        //     return res.status(401).json({ message: 'Token expired, please login again' });
        // }


        // console.log(verifyToken(token, config.secret));
        // const decoded = await verifyToken(token, config.secret, ws)
        // console.log("decoded");
        // console.log(decoded);
        // if (decoded === undefined){
        //     [...wss.clients]
        //         .forEach(c => c.send(JSON.stringify({
        //             "event": "message",
        //             "data": "Token Required or expired"
        //         })));
        //     return;
        // }
        // const userId = decoded.id;
        //
        //
        // connection.userdetails = await User.findOne({ where: { id: userId } });
        // connection.userdetails = await Developer.findOne({id: decode.id}, {$set: {online_status: 1}});
        console.log(connection);
        connection.on('message', async (message) => {
            console.log(message);
            const messageData = JSON.parse(message);
            const{event, data} = messageData;
            if(event === "message" ){
                await messages(connection, data);


            }else if(event === "typing" ){
                await typing(connection, data);
            }else if(event === "reading" ){
                await reading(connection, data);
            }else  if(event === "auth" ){
                await auth(connection, data);
            }
        });

    });

    wss.on('close', data => {
        console.log('disconnect', data);
    });


    async function messages(connection,messageData){

        const{recipient, text, file, usertype} = messageData;
        let filename = null;
        if (file) {
            const parts = file.name.split('.');
            const ext = parts[parts.length - 1];
            filename = Date.now() + "." + ext;
            const path = __dirname + '/public/chat/' + filename;
            const bufferData = new Buffer(file.data.split(',')[1], 'base64');
            fs.writeFile(path, bufferData, () => {
                console.log('file saved: ' + path);
            })
        }
        // console.log(connection.userdetails);
        console.log(messageData);
        console.log(recipient);
        console.log(recipient && text);
        if( text || recipient) {
            const check={
                senderId: connection.userdetails.roles==="admin" ? 0:connection.userdetails.id,
                recipientId: recipient,
                content: text,
            };
            console.log(check);
            console.log(connection.userdetails.role);

            const messageDoc = await Chat.create({
                senderId: connection.userdetails.role==="admin" ? 0:connection.userdetails.id,
                recipientId: recipient,
                content: text,
                // file: file? filename : null
            });
            if(recipient === 0){
                const admin=await User.findAll({
                    where:{
                        role:"admin",
                    },
                });
                admin.forEach(function (element){

                    [...wss.clients]
                        .filter(c => c.userdetails.id === element.id)
                        .forEach(c => c.send(JSON.stringify({
                            "event": "message",
                            "data": messageDoc
                        })));
                });
            } else {
                [...wss.clients]
                    .filter(c => c.userdetails.id === recipient)
                    .forEach(c => c.send(JSON.stringify({
                        "event": "message",
                        "data": messageDoc
                    })));
            }

        }
    }
    async function typing(connection,messageData){

        const{recipient} = messageData;
        if(recipient ) {

            if(recipient === 0){
                const admin=await User.findAll({
                    where:{
                        role:"admin",
                    },
                });
                admin.forEach(function (element){

                    [...wss.clients]
                        .filter(c => c.userdetails.id === element.id)
                        .forEach(c => c.send(JSON.stringify({
                            "event": "typing",
                            "data": {
                                "sender_id": 0,
                                "receiver_id": recipient,
                            }
                        })));
                });
            }else {
                console.log("let go");
                [...wss.clients]
                    .filter(c => c.userdetails.id === recipient)
                    .forEach(c => c.send(JSON.stringify({
                        "event": "typing",
                        "data": {
                            "sender_id": 0,
                            "receiver_id": recipient,
                        }
                    })));
            }

        }
    }
    async function reading(connection,messageData){

        const{meesageid} = messageData;
        if(meesageid) {

                const admin=await Chat.update({read:1},
                    {
                        where: {
                            id: meesageid,
                        },
                    });
            }

        }
    async function auth(connection,messageData){
        const{token} = messageData;

        console.log(verifyToken(token, config.secret));
        const decoded = await verifyToken(token, config.secret, ws)
        console.log("decoded");
        console.log(decoded);
        if (decoded === undefined){
            connection.send(JSON.stringify({
                "event": "message",
                "data": "Token Required or expired"
            }))
            connection.close()
            // [...wss.clients]
            //     .forEach(c => c.send(JSON.stringify({
            //         "event": "message",
            //         "data": "Token Required or expired"
            //     })));
            return;
        }
        const userId = decoded.id;
        const start = await User.findOne({ where: { id: userId } });


        [...wss.clients]
            .forEach(client => {
                console.log("client aaaaaa");
                console.log(client.userdetails);
                if (client.userdetails !== start){
                    connection.userdetails = start;
                }
            });

        // connection.userdetails = await Developer.findOne({id: decode.id}, {$set: {online_status: 1}});

        notifyAboutOnlinePeople();

    }
}

module.exports = websocket;






