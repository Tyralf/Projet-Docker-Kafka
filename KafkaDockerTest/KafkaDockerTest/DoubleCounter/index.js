//Load express module with require directive
var express = require('express')
var app = express()
var counter = 0
const fs = require('fs');
const { Kafka } = require('kafkajs')

let rawdata = fs.readFileSync(__dirname + '/../env.json');  
let env = JSON.parse(rawdata);  

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka:9091']
})



const consumer = kafka.consumer({ groupId: 'test-group' })
const run = async () => {
  await consumer.connect()
  await consumer.subscribe({ topic : 'test-topic' })
  await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
      counter += 2;
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
      console.log(`- ${prefix} ${message.key}#${message.value}`)
    },
  })
}

setTimeout (function(){run().catch(e => console.error(`[example/consumer] ${e.message}`, e))},env.listener.kafka_connect_timeout);


app.get('/counter', function (req, res) {
  res.send('Count : ' + counter + " fois");
})

app.get('/message', function (req, res) {
  res.send(asyncResult());
})

//Launch listening server on port 8081
app.listen(env.counter.port, function () {
  console.log('app listening on port ' + env.counter.port + ' !')
})