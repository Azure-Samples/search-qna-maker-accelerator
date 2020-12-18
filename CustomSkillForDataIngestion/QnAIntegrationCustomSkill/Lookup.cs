using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Common;
using Azure;
using Azure.Search.Documents;
using Azure.Search.Documents.Models;
using Azure.Storage.Blobs;
using Azure.Storage;
using Azure.Storage.Sas;
using System.Net;
using Microsoft.Azure.Storage.Auth;

namespace QnAIntegrationCustomSkill
{
    public static class Lookup
    {
        private static string searchApiKey = Environment.GetEnvironmentVariable("SearchServiceApiKey", EnvironmentVariableTarget.Process);
        private static string searchServiceName = Environment.GetEnvironmentVariable("SearchServiceName", EnvironmentVariableTarget.Process);
        private static string searchIndexName = Constants.indexName;

        private static string storageAccountName = Environment.GetEnvironmentVariable("StorageAccountName", EnvironmentVariableTarget.Process);
        private static string storageAccountKey = Environment.GetEnvironmentVariable("StorageAccountKey", EnvironmentVariableTarget.Process);
        private static string storageContainerName = Constants.containerName;

        private static StorageSharedKeyCredential sharedStorageCredentials = new StorageSharedKeyCredential(storageAccountName, storageAccountKey);

        // Create a SearchIndexClient to send create/delete index commands
        private static Uri serviceEndpoint = new Uri($"https://{searchServiceName}.search.windows.net/");
        private static AzureKeyCredential credential = new AzureKeyCredential(searchApiKey);

        // Create a SearchClient to load and query documents
        private static SearchClient searchClient = new SearchClient(serviceEndpoint, searchIndexName, credential);

        [FunctionName("Lookup")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");
            string id = req.Query["id"];
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject(requestBody);
            id = id ?? data?.id;

            var response = await searchClient.GetDocumentAsync<SearchDocument>(id);


            object metadata_storage_name;
            response.Value.TryGetValue("metadata_storage_name", out metadata_storage_name);

            var policy = new BlobSasBuilder
            {
                Protocol = SasProtocol.HttpsAndHttp,
                BlobContainerName = storageContainerName,
                BlobName = metadata_storage_name.ToString(),
                Resource = "b",
                StartsOn = DateTimeOffset.UtcNow,
                ExpiresOn = DateTimeOffset.UtcNow.AddHours(1),
                IPRange = new SasIPRange(IPAddress.None, IPAddress.None)
            };
            policy.SetPermissions(BlobSasPermissions.Read);

            var sas = policy.ToSasQueryParameters(sharedStorageCredentials);

            LookupOutput output = new LookupOutput();
            output.document = response.Value;
            output.sasToken = sas.ToString();

            return new OkObjectResult(output);
        }
    }
}
