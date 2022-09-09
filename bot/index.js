const config = require('./config.js'),
      Lokka = require('lokka').Lokka,
      util = require('util'),
      Transport = require('lokka-transport-http').Transport;
      
const replyToCheck = (annotated_id, team_slug, callback) => {
  const vars = {
    annotated_id,
    clientMutationId: 'hello-check' + parseInt(new Date().getTime()),
  };

  const mutationQuery = `($annotated_id: String!, $clientMutationId: String!) {
    createTag(input:{
      clientMutationId: $clientMutationId,
      tag: "🤖 Politics",
      annotated_id: $annotated_id,
      annotated_type: "ProjectMedia"
    }) {
      tagEdge {
        node {
          dbid
          tag
        }
      }
    }
    
  }`;

  const headers = {
    'X-Check-Token': config.checkApiAccessToken
  };
  const transport = new Transport(config.live.checkApiUrl + '/api/graphql?team=' + team_slug, { headers, credentials: false, timeout: 120000 });
  const client = new Lokka({ transport });

  client.mutate(mutationQuery, vars)
  .then(function(resp, err) {
    console.log('Response: ' + util.inspect(resp));
    callback(null);
  })
  .catch(function(e) {
    console.log('Error when executing mutation: ' + util.inspect(e));
    callback(null);
  });
};


exports.handler = (event, context, callback) => {
  const data = JSON.parse(event.body);
  console.log('JSON.parse(event.body)', data);
  if (data.event === 'create_project_media') {
    const headers = null;
    const pmid = data.data.dbid.toString();
    const projectId = data.object.project_id.toString();
    // if(projectId == '15374'){
      const title = data.data.title.toString();

      // const https = require('https');
      const http = require('http');
  
      var postData = JSON.stringify({
          'text' : title
      });
      
      var options = {
        hostname: 'ml-brpolitics-1305663479.eu-west-1.elb.amazonaws.com',
        // port: 443,
        path: '/brazil/is_politics/',
        method: 'POST'//,
        //headers: {
        //  'Content-Type': 'application/json',
        //  'Content-Length': postData.length,
        //}
      };
      
      var req = http.request(options, (res) => {
        res.setEncoding('utf8');
        let responseBody = '';
      
        res.on('data', (chunk) => {
            responseBody += chunk;
        });
      
        res.on('end', () => {
          console.log("responseBody");
          const json_obj = JSON.parse(responseBody);
          console.log(json_obj);
          if (json_obj['is_politics'] == "1"){
            replyToCheck(pmid, data.team.slug, callback);
          }
        });
      });
      
      req.on('error', (e) => {
        console.error(e);
      });
      
      req.write(postData);
      req.end();
    // }
   
  } 
  else {
    callback(null);
  }
};
