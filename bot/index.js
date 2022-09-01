const config = require('./config.js'),
      Lokka = require('lokka').Lokka,
      util = require('util'),
      Transport = require('lokka-transport-http').Transport;
      
const replyToCheck = (annotated_id, team_slug, callback) => {
  console.log('pmid', annotated_id);
  console.log('team_slug', team_slug);
  const vars = {
    annotated_id,
    clientMutationId: 'hello-check' + parseInt(new Date().getTime()),
  };

  // const mutationQuery = `($annotated_id: String!, $clientMutationId: String!) {
  //   createComment: createComment(input: { clientMutationId: $clientMutationId, text: $text, annotated_id: $pmid, annotated_type: "ProjectMedia"}) {
  //     comment {
  //       text
  //     }
  //   }
  // }`;
  
    const mutationQuery = `($annotated_id: String!, $clientMutationId: String!) {
    
      createTag(input:{
        clientMutationId: $clientMutationId,
        tag: "🤖 politics",
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
  // const mutationQuery = `( $annotated_id: String!, $clientMutationId: String!) {
  //   mutation {
  //     createTag(input:{
  //       clientMutationId: $clientMutationId,
  //       tag: "politics",
  //       annotated_id: $annotated_id,
  //       annotated_type: "ProjectMedia"
  //     }) {
  //       tagEdge {
  //         node {
  //           dbid
  //           tag
  //         }
  //       }
  //     }
  //   }
  // }`;
// const mutationQuery = `( $annotated_id: String!, $clientMutationId: String!) {
//     mutation {
//       createTag(input:{
//         clientMutationId: $clientMutationId,
//         tag: "politics",
//         annotated_id: $annotated_id,
//         annotated_type: "ProjectMedia"
//       }) {
//         tagEdge {
//           node {
//             dbid
//             tag
//           }
//         }
//       }
//     }
//   }`;

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

  
  
  
  // replyToCheck("1383818", "check-testing", callback);
  const data = JSON.parse(event.body);
  console.log('JSON.parse(event.body)', data);
  if (data.event === 'create_project_media') {
    const headers = null;
    const pmid = data.data.dbid.toString();
    const projectId = data.object.project_id.toString();
    console.log("projectId",projectId);
    if(projectId == '15374'){
      const title = data.data.title.toString();
      console.log('title', title);
  
      console.log('annotated_id', pmid);
      // if (pmid == "1383812") {
      const https = require('https');
  
      var postData = JSON.stringify({
          'text' : title
      });
      
      var options = {
        hostname: 'bd6b-2a02-a311-803e-2d80-5ddd-178-c3bf-2954.eu.ngrok.io',
        // port: 443,
        // path: 'brazil/is_politics',
        method: 'POST',
        // headers: {
        //     'Content-Type': 'application/x-www-form-urlencoded',
        //     'Content-Length': postData.length
        //   }
      };
      
      var req = https.request(options, (res) => {
        console.log("https.get(url, (res)");
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
            console.log('daaaaa', "daaa");
      
            replyToCheck(pmid, data.team.slug, callback);
          }
        });
      });
      
      req.on('error', (e) => {
        console.error(e);
      });
      
      req.write(postData);
      req.end();
    }
   
  } 
  else {
    callback(null);
  }
};
