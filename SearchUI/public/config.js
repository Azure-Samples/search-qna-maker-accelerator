var http = require('http');
var server = http.createServer((request, response) => {

  let variables = {
                    "code": process.env.REACT_APP_FUNCTION_CODE,
                    "url": process.env.REACT_APP_FUNCTION_URL
                  };
  response.writeHead(200, {'Content-Type': 'application/json'});
  response.end(JSON.stringify(variables));
});
server.listen(process.env.PORT || 3000);
