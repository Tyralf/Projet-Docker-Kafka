//Code pour generer fichier YML
//const yaml = require('js-yaml');
const fs = require('fs');

let rawdata = fs.readFileSync(__dirname + '/../services.txt');  
var text = rawdata.toString();

let env = JSON.parse(fs.readFileSync(__dirname + '/../env.json'));

let registre = JSON.parse(fs.readFileSync(__dirname + '/registre.json'));
//let env = JSON.parse(rawdata);  

function content(){
    //Generation YAML

    var content = "version: \'3\'\r\
    # Kafka and zookeeper services\r\
    services:\r\
      version: '2'\r\
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
        \r\
        \r\
    "

    console.log(registre);

    var services = text.split("\n");

    console.log("le 1 : " + services[0]);
    console.log("le 2 : " + services[1]);

    objService = {
      DockerName : services[0].toLowerCase(),
      DirName : services[0],
            
    }
    console.log(objService);
    //virer 3 premières lignes en gros 
    service = "\
  "+services[0].toLowerCase()+":\r\
        build:\r\
          context: .\r\
          dockerfile: "+services[0]+"/dockerfile\r\
        ports:\r\
          - \"8080:8080\" \r\
        restart: unless-stopped\r\
        depends_on:\r\
          - zookeeper\r\
          - kafka\r\
    "

    return content + service;
}

console.log(content());

fs.appendFile('docker-compose.yml', content(), function (err) {
    if (err) throw err;
    console.log('File is created successfully.');
}); 

