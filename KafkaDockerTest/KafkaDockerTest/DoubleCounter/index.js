//Load express module with require directive
var express = require('express')
var app = express()
var counter = 0
const fs = require('fs');
const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka:9091']
})

const consumer = kafka.consumer({ groupId: ''+process.env.DOUBLECOUNTER_KAFKA_GROUP })
const run = async () => {
  await consumer.connect()
  await consumer.subscribe({ topic : ''+process.env.DOUBLECOUNTER_KAFKA_TOPIC })
  await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
      counter += 2;
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
      console.log(`- ${prefix} ${message.key}#${message.value}`)
    },
  })
}

setTimeout (function(){run().catch(e => console.error(`[example/consumer] ${e.message}`, e))},30000);


app.get('/counter', function (req, res) {
  res.send('Count : ' + counter + " fois");
})

app.get('/message', function (req, res) {
  res.send(asyncResult());
})

//Launch listening server on port 8081
app.listen(process.env.DOUBLECOUNTER_PORT, function () {
  console.log('app listening on port ' + process.env.DOUBLECOUNTER_PORT + ' !')
})