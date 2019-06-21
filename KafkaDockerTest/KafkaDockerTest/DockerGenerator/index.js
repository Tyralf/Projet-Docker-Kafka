//Code pour generer fichier YML
//const yaml = require('js-yaml');
const fs = require('fs');

let registre = JSON.parse(fs.readFileSync(__dirname + '/registre.json'));

//Check Registre



//  TestNames
var services = [];
for (let j = 2; j < process.argv.length; j++) {  
  services.push({name : process.argv[j], info : null});
}
var servicefound;
var chosenServices = [];
services.forEach(service => {
  servicefound = false;
  for( let prop in registre ){
    if (service.name == registre[prop].name) {
      console.log("[INFO] Identification du service : " + registre[prop].name)
      service.info = registre[prop];
      servicefound = true;
      chosenServices.push(service);   
    }     
  } 
  if(servicefound == false){
    console.log("[ERREUR] Aucun service trouvé pour : " + service.name);
  }
});

function testDependance(services){
  var dependanceFound;
  var testResult;
  services.forEach(service => {
    dependanceFound = false;
    service.info.dependences.forEach(dependance => {
      if (dependance != 'kafka' && dependance != 'zookeeper') {
        dependanceFound = false;
        services.forEach(element => {
          if (dependance == element.name) {
             console.log("[INFO] Service " + element.name + " trouvé comme depedence pour le service : " + service.name );
             dependanceFound = true;
             testResult = true;             
          }
        });
        if(dependanceFound == false){
          console.log("[ERREUR] Il manque le service : " + dependance + " dont depend le service " + service.name);
          testResult = false;
        }
      }
      else{
        dependanceFound = true;
      }
    });
  });
  return testResult;
}

function testType(services){
  var topiclisteners ;
  var topicproducers ;
  var topics = [];
  var testResult;
  services.forEach(service => {
    if (!topics.includes(service.info.topic_name)) {
      topics.push(service.info.topic_name);
    }
  });

  topics.forEach(topic => {
    topiclisteners = 0;
    topicproducers = 0;
    services.forEach(element => {
      if(element.info.type.producer == true){
        topicproducers ++;
      }
      if(element.info.type.listener == true){
        topiclisteners ++;
      }
    });
    if (topicproducers == 0 && topiclisteners != 0) {
      console.log("[ERREUR] Liseners attendent des messages non produits sur le topic: " + topic);
      testResult = false;
    }
    else{
      testResult = true;
    }
  }); 
  return testResult;   
}

//Generation
function content(){
    //Generation YAML
    var content = "\
version: \'3\'\r\
services:\r\
  zookeeper:\r\
    image: 'bitnami/zookeeper:latest'\r\
    ports:\r\
      - '2191:2181'\r\
    environment:\r\
      - ZOO_SERVER_ID=1\r\
      - ALLOW_ANONYMOUS_LOGIN=yes\r\
  kafka:\r\
    image: 'bitnami/kafka:latest'\r\
    ports:\r\
      - '9091:9091'\r\
    environment:\r\
      - KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181\r\
      - ALLOW_PLAINTEXT_LISTENER=yes\r\
      - KAFKA_ZOOKEEPER_CONNECT_TIMEOUT_MS=36000\r\
      - KAFKA_LISTENERS=PLAINTEXT://:9091\r\
      - KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://:9091\r\
      - KAFKA_LISTENER_PORT=9091\r\
      - KAFKA_LISTENER_TIMEOUT=30000\r\
\r\
"
    return content 
}


function createServices(services){
  //Generation YAML
  var port = 8080;
  var content = "";
  services.forEach(service => {
    
    content += "\r\
  " + service.name + ":\r\
    image: '" + service.name + ":Dockerfile'\r\
    ports:\r\
      - \"" + port + ":" + port + "\"\r\
    restart: unless-stopped\r\
    depends_on:\r\
      - zookeeper\r\
      - kafka\r\
    environment:\r\
      - " + service.name.toUpperCase() + "_PORT=" + port + "\r\
      - " + service.name.toUpperCase() + "_KAFKA_TOPIC=" + service.info.topic_name + "\r\
      - " + service.name.toUpperCase() + "_KAFKA_GROUP=test_group\r\
    \r\
    "
      port ++;
  });
  return content 
}

if (fs.existsSync(__dirname + '/../docker-compose.yml')) {
  fs.unlinkSync(__dirname + '/../docker-compose.yml');
}

fs.appendFile(__dirname + '/../docker-compose.yml', content(), function (err) {
  if (err) throw err;
  console.log('[INFO] DockerFile crée contenant un bus Kafka');
}); 

var test1 = testDependance(chosenServices);
var test2 = testType(chosenServices);

if (test1 && test2) {
  fs.appendFile(__dirname + '/../docker-compose.yml', createServices(chosenServices), function (err) {
    if (err) throw err;
    console.log('[INFO] Services ajoutés dans la DockerFile');
}); 
}



