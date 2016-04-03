'use strict';
const 
  es = require('elasticsearch'),
  client = new es.Client({
      hosts: ['http://es:9200','http://es:9300'],
      apiVersion: '2.2',
      sniffOnStart: true,
      keepAlive: true
    });
    
module.exports = client;