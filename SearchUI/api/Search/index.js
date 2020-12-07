const { SearchClient, AzureKeyCredential } = require("@azure/search-documents");
const { QnAMakerRuntimeClient } = require('@azure/cognitiveservices-qnamaker-runtime');
const { CognitiveServicesCredentials } =  require("@azure/ms-rest-azure-js");

const indexName = process.env["SearchIndexName"];
const apiKey = process.env["SearchApiKey"];
const searchServiceName = process.env["SearchServiceName"];
const qnaMakerKey = process.env["QnAMakerKey"];
const endpoint = process.env["QnAMakerEndpoint"];
const kbId = process.env["QnAMakerKnowledgeBaseID"];
const customHeaders = { Authorization: `EndpointKey ${qnaMakerKey}` };

// Create a SearchClient to send queries
const searchClient = new SearchClient(
    `https://` + searchServiceName + `.search.windows.net/`,
    indexName,
    new AzureKeyCredential(apiKey)
);

// Create a QnAMakerClient
const creds = new CognitiveServicesCredentials(qnaMakerKey);
const qnaClient = new QnAMakerRuntimeClient(creds, endpoint);

// creates filters in odata syntax
const createFilterExpression = (filterList, facets) => {
    let i = 0;
    let filterExpressions = [];

    while (i < filterList.length) {        
        let field = filterList[i].field;
        let value = filterList[i].value;

        if (facets[field] === 'array') {
            filterExpressions.push(`${field}/any(t: search.in(t, '${value}', ','))`);
        } else {
            filterExpressions.push(`${field} eq '${value}'`);
        }
        i += 1;
    }

    return filterExpressions.join(' and ');
}

// reads in facets and gets type
// array facets should include a * at the end 
// this is used to properly create filters
const readFacets = (facetString) => {
    let facets = facetString.split(",");
    let output = {};
    facets.forEach(function (f) {
        if (f.indexOf('*') > -1) {
            output[f.replace('*', '')] = 'array';
        } else {
            output[f] = 'string';
        }
    })

    return output;
}

const removeStopwords = (q) => {
    const stopWords = ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't", "did",
      "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
      "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only",
      "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then",
      "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when",
      "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"];

    let words = q.toLowerCase().split(' ');

    var i;
    var output = [];
    for (i = 0; i < words.length; i++) {
      if (stopWords.indexOf(words[i].trim()) < 0 ) {
        output.push(words[i]);
      }
    }

    return output.join(" ");
  }

module.exports = async function (context, req) {

    //context.log(req);

    try {
        // Reading inputs from HTTP Request
        let q = (req.query.q || (req.body && req.body.q));
        const top = (req.query.top || (req.body && req.body.top));
        const skip = (req.query.skip || (req.body && req.body.skip));
        const filters = (req.query.filters || (req.body && req.body.filters));
        const facets = readFacets(process.env["SearchFacets"]);
        const getAnswer = (req.query.getAnswer || (req.body && req.body.getAnswer));

        // If search term is empty, search everything
        if (!q || q === "") {
            q = "*";
        }

        // Creating SearchOptions for query
        let searchOptions = {
            top: top,
            skip: skip,
            includeTotalCount: true,
            facets: Object.keys(facets),
            filter: createFilterExpression(filters, facets),
            highlightFields: "content",
            searchMode: "any"
        };

        // Sending the search request
        const searchResults = await searchClient.search(removeStopwords(q), searchOptions);

        // Getting results for output
        const output = [];
        for await (const result of searchResults.results) {
            output.push(result);
        }

        var answer;
        if (getAnswer) {
            let body = {
                question: q,
                top: 1,
                scoreThreshold: 30,
            }
    
            answer = await qnaClient.runtime.generateAnswer(kbId, body, {customHeaders});
        }

        // Creating the HTTP Response
        context.res = {
            // status: 200, /* Defaults to 200 */
            headers: {
                "Content-type": "application/json"
            },
            body: {
                count: searchResults.count,
                results: output,
                facets: searchResults.facets,
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
