const { SearchClient, AzureKeyCredential } = require("@azure/search-documents");

const indexName = process.env["SearchIndexName"];
const apiKey = process.env["SearchApiKey"];
const searchServiceName = process.env["SearchServiceName"];

// Create a SearchClient to send queries
const client = new SearchClient(
    `https://` + searchServiceName + `.search.windows.net/`,
    indexName,
    new AzureKeyCredential(apiKey)
);

module.exports = async function (context, req) {
    
    context.log(req);

    // Reading inputs from HTTP Request
    const q = (req.query.q || (req.body && req.body.q));
    const top = (req.query.top || (req.body && req.body.top));
    const suggester = (req.query.suggester || (req.body && req.body.suggester));
    
    // Let's get the top 5 suggestions for that search term
    const suggestions = await client.suggest(q, suggester, {top: parseInt(top)});
    //const suggestions = await client.autocomplete(q, suggester, {top: parseInt(top)});

    context.log(suggestions);

    context.res = {
        // status: 200, /* Defaults to 200 */
        headers: {
            "Content-type": "application/json"
        },
        body: { suggestions: suggestions.results}
    };
};
