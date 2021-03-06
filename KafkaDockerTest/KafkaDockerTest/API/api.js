var express = require('express'); 
// Nous définissons ici les paramètres du serveur.
var hostname = 'localhost'; 
var app = express(); 
var testMsg = 'placeholder1';
var myRouter = express.Router(); 
var bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const { Kafka } = require('kafkajs')
const fs = require('fs');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka:9091']
})

const producer = kafka.producer()
function asyncMessage(message) {
    producer.connect()
    producer.send({
    topic: process.env.API_KAFKA_TOPIC,
    messages: [
        { value: message },
    ],
    })
    producer.disconnect()
};

myRouter.route('/test')
// GET
.get(function(req,res){ 
 res.json({
   message : "retourne le message : " + recoitMessage()});
 })
//POST
.post(function(req,res){
    res.json({message : "Envoi le message : " + req.body.myMessage});
    envoiMessage(req.body.myMessage);
})
 
// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);  

// Démarrer le serveur 
app.listen(process.env.API_PORT, function(){
	console.log("Mon serveur fonctionne sur http://localhost:" + process.env.API_PORT); 
});


function envoiMessage(Message){
    testMsg = Message;
    asyncMessage(Message);
}
function recoitMessage(){
    return testMsg
}



