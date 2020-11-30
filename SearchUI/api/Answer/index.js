const { QnAMakerRuntimeClient } = require('@azure/cognitiveservices-qnamaker-runtime');
const { CognitiveServicesCredentials } =  require("@azure/ms-rest-azure-js");

const qnaMakerKey = process.env["QnAMakerKey"];
const endpoint = process.env["QnAMakerEndpoint"];
const kbId = process.env["QnAMakerKnowledgeBaseID"];
const customHeaders = { Authorization: `EndpointKey ${qnaMakerKey}` };

// Create a QnAMakerClient
const creds = new CognitiveServicesCredentials(qnaMakerKey);
const client = new QnAMakerRuntimeClient(creds, endpoint);


module.exports = async function (context, req) {

    //context.log(req);

    try {
        // Reading inputs from HTTP Request
        let q = (req.query.q || (req.body && req.body.q));

        let body = {
            question: q,
            top: 1,
            scoreThreshold: 30,
            // strictFilters: [
            //   {
            //     "name": "category",
            //     "value": "api"
            //   }
            // ]
        }

        let answer = await client.runtime.generateAnswer(kbId, body, {customHeaders});

        //context.log(answer);


        // Creating the HTTP Response
        context.res = {
            // status: 200, /* Defaults to 200 */
            headers: {
                "Content-type": "application/json"
            },
            body: {
                answers: answer["answers"]
            }
        };
    } catch (error) {
        context.log.error(error);

        // Creating the HTTP Response
        context.res = {
            status: 400,
            body: {
                innerStatusCode: error.statusCode || error.code,
                error: error.details || error.message
            }
        };
    }

};
