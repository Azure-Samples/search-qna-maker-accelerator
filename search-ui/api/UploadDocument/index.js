const { BlobServiceClient, ContainerClient } = require("@azure/storage-blob");

const storageAccountName = process.env["StorageAccountName"];
const storageAccountKey = process.env["StorageAccountKey"];
const storageContainerName = process.env["StorageContainerName"];

// Create a blob service client and container client to upload a new blob
const blobConnectionString = `DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${storageAccountKey};EndpointSuffix=core.windows.net`;
const blobServiceClient = BlobServiceClient.fromConnectionString(blobConnectionString);
const container = blobServiceClient.getContainerClient(storageContainerName);

module.exports = async function (context, req) {

    const fileName = req.body.name;
    const file = req.body.file;

    const buffer = Buffer.from(file, 'base64');
    container.uploadBlockBlob(fileName, buffer, buffer.length);

    context.res = {
        // status: 200, /* Defaults to 200 */
        headers: {
            "Content-type": "application/json"
        },
        body: { Status: "Uploaded" }
    };

};
