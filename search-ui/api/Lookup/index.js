const { SearchClient, AzureKeyCredential } = require("@azure/search-documents");
const { BlobServiceClient} = require("@azure/storage-blob");

const indexName = process.env["SearchIndexName"];
const apiKey = process.env["SearchApiKey"];
const searchServiceName = process.env["SearchServiceName"];

const storageAccountName = process.env["StorageAccountName"];
const storageAccountKey = process.env["StorageAccountKey"];
const storageContainerName = process.env["StorageContainerName"];

// Create a blob client to get a sas token for the document
const blobConnectionString = `DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${storageAccountKey};EndpointSuffix=core.windows.net`;
const blobServiceClient = BlobServiceClient.fromConnectionString(blobConnectionString);

// Create a SearchClient to send queries
const client = new SearchClient(
    `https://` + searchServiceName + `.search.windows.net/`,
    indexName,
    new AzureKeyCredential(apiKey)
);

const getSasToken = (blobName) => {
    const container = blobServiceClient.getContainerClient(storageContainerName);
    const blob = container.getBlobClient(blobName);
    const sasToken = blob.getSasToken();

    return sasToken;
}

module.exports = async function (context, req) {
    
    //context.log(req);

    // Reading inputs from HTTP Request
    const id = (req.query.id || (req.body && req.body.id));
    
    // Returning the document with the matching id
    const document = await client.getDocument(id)

    context.log(document);

    context.res = {
        // status: 200, /* Defaults to 200 */
        headers: {
            "Content-type": "application/json"
        },
        body: { document: document}
    };
    
};
