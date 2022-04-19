'use strict';

const { connect, StringCodec } = require("nats");
const sc = require('node-nats-streaming').connect('test-cluster', 'stan-sub')


module.exports = async function(context) {
    sc.on('connect', () => {
        // Simple Publisher (all publishes are async in the node version of the client)
        sc.publish('request', 'Hello node-nats-streaming!', (err, guid) => {
          if (err) {
            console.log('publish failed: ' + err)
          } else {
            console.log('published message with guid: ' + guid)
          }
        })        
      })
      
    sc.on('close', () => {
        return {
            status: 200,
        };
    })
    
}