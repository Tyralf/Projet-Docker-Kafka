//Load express module with require directive
var express = require('express')
var app = express()
var counter = 0

const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka_1:9091']
})

const consumer = kafka.consumer({ groupId: 'test-group' })
async function asyncF(){
  await consumer.connect()
  await consumer.subscribe({ topic: 'test-topic' })

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        value: message.value.toString(),
      })
    },
  })
};

//Define request response in root URL (/)
app.get('/', function (req, res) {
    counter++
    res.send('Count : ' + counter + " fois")
})

//Launch listening server on port 8081
app.listen(8081, function () {
  console.log('app listening on port 8081!')
})

asyncF();