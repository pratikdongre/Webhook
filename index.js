    const express = require("express");//express provides easy way to establish web server connection

    const body_parser = require("body-parser"); // parses th req into the readable form from which you can easily extract information
    const axios = require("axios");

    const app = express().use(body_parser.json());
    require('dotenv').config();

    const fs = require('fs'); //file system for logging


    const logFile = fs.createWriteStream('webhook.log', { flags: 'a' });


    //you need to put the callback url on the server eg whatsapp api and verify token that you have set here in env
    //the callback url has been made using ngrok so puth that url + webhoook // endpoint 


    const token = process.env.TOKEN; // for sending the request  // temporary access token
    const mytoken = process.env.MYTOKEN; // for verifiication the webhook


    app.listen(8000 || process.env.PORT,()=>{

        console.log("webhook is listening");

    });

    //  GET https://c986-27-107-168-78.ngrok-free.app/webhook?hub.mode=subscribe&hub.challenge=testchallenge&verify_token=pratik
    // output testchallenge 

    //to verify the callback url from the cloud api side 
    app.get("/webhook",(req,res)=>{

        let mode = req.query["hub.mode"];
        let challenge = req.query["hub.challenge"];
        let verify_token = req.query["verify_token"];


        if(mode && verify_token){

            if (mode === "subscribe" && verify_token === mytoken)
            {
                res.status(200).send(challenge);
            }
            else {
                res.status(403).send("Forbidden");
            }
        }

    });



    //this endpoint post/webhoook recived post requ from whatsapp api whenever an event occur in this 
    // its when a customer send a message 
    // the data is logged 
    //it then send the message im pratik back to the user 



    app.post("/webhook",(req,res)=>{

        let body_param = req.body;

        console.log(JSON.stringify(body_param, null, 2));
        logFile.write(`${new Date().toISOString()} - ${JSON.stringify(body_param, null, 2)}\n`);

        
        // at this point check the payload example to fill the type of var that server required 

        if (body_param.object)
        {
            if(body_param.entry && 
                body_param.entry[0].changes &&
                body_param.entry[0].changes[0].value.messages &&
                body_param.entry[0].changes[0].value.messages[0]
                )
                {
                    let phone_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
                    let from = body_param.entry[0].changes[0].value.messages[0].from; // user phone number 
                    let msg_body =body_param.entry[0].changes[0].value.messages[0].text.body;

                //    respond msg 
                    axios({
                        method : "POST",
                        url : "https://graph.facebook.com/v20.0/"+phone_no_id+"/messages?access_token="+token,
                        data : {
                            "messaging_product": "whatsapp",
                            "to" : from,
                            "text" : {
                                body : "HI im pratik"
                            }
                        },
                        headers :{
                            "Content-Type": "application/json",

                        }

                        
                    }).then(response => {
                        console.log('Message sent successfully:', response.data);
                        logFile.write(`${new Date().toISOString()} - Message sent successfully: ${JSON.stringify(response.data, null, 2)}\n`);
                    }).catch(error => {
                        console.error('Error sending message:', error);
                        logFile.write(`${new Date().toISOString()} - Error sending message: ${error}\n`);
                    });

                    res.sendStatus(200);

                }
                else {
                    res.sendStatus(404);
                }
        }
        
    });

        // app.post("/webhook",(req,res)=>{
        //     console.log(JSON.stringify(body_param,null,2));
        //                         res.sendStatus(200);

        // })
 

    //health check
    //A simple endpoint that returns a status message to confirm that the server is up and running.
    app.get("/",(req,res)=>{
        res.status(200).send("hello this is the webhook setup");
    });