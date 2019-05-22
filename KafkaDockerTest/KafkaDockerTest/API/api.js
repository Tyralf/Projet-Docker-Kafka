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

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka_1:9091']
})

const producer = kafka.producer()
async function asyncF() {
    await producer.connect()
    await producer.send({
    topic: 'test-topic',
    messages: [
        { value: 'Hello KafkaJS user!' },
    ],
    })
    await producer.disconnect()
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
app.listen(8080, function(){
	console.log("Mon serveur fonctionne sur http://localhost:8080"); 
});

asyncF();

function envoiMessage(Message){
    testMsg = Message;
}
function recoitMessage(){
    return testMsg
}



