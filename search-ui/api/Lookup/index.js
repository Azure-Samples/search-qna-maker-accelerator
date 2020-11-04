const { SearchClient, AzureKeyCredential } = require("@azure/search-documents");
const { StorageSharedKeyCredential, ContainerSASPermissions, generateBlobSASQueryParameters} = require("@azure/storage-blob");

const indexName = process.env["SearchIndexName"];
const apiKey = process.env["SearchApiKey"];
const searchServiceName = process.env["SearchServiceName"];

const storageAccountName = process.env["StorageAccountName"];
const storageAccountKey = process.env["StorageAccountKey"];
const storageContainerName = process.env["StorageContainerName"];

// Create a SearchClient to send queries
const client = new SearchClient(
    `https://${searchServiceName}.search.windows.net/`,
    indexName,
    new AzureKeyCredential(apiKey)
);

const generateSasToken = (accountName, accountKey, container, blob, permissions) => {
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    var expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 10);

    const sasKey = generateBlobSASQueryParameters({
        containerName: container,
        blobName: blob,
        permissions: ContainerSASPermissions.parse(permissions),
        expiresOn: expiryDate,
        startsOn: new Date()
    }, sharedKeyCredential);

    return sasKey.toString();
}

module.exports = async function (context, req) {
    

    // Reading inputs from HTTP Request
    const id = (req.query.id || (req.body && req.body.id));
    
    // Returning the document with the matching id
    const document = await client.getDocument(id)

    const permissions = 'r';
    const sasToken = generateSasToken(storageAccountName, storageAccountKey, storageContainerName, document.metadata_storage_name, permissions);

    context.res = {
        // status: 200, /* Defaults to 200 */
        headers: {
            "Content-type": "application/json"
        },
        body: { document: document,
                sasToken: sasToken}
    };
    
};
