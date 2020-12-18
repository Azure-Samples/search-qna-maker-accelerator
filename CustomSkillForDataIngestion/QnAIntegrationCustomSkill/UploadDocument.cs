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
using Azure.Search.Documents.Indexes;
using Azure;
using Azure.Search.Documents;
using System.Collections.Generic;
using Microsoft.Extensions.Options;
using Azure.Search.Documents.Models;
using System.Linq;
using Azure.Storage.Blobs;
using Azure.Storage;
using Azure.Storage.Sas;
using System.Net;
using System.Net.Http;
using Azure.Storage.Blobs.Models;

namespace QnAIntegrationCustomSkill
{
    public static class UploadDocument
    {
        private static BlobServiceClient blobServiceClient = new BlobServiceClient(Environment.GetEnvironmentVariable("AzureWebJobsStorage", EnvironmentVariableTarget.Process));
        private static BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient(Constants.containerName);

        [FunctionName("Upload")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            string fileName = req.Query["name"];
            string file = req.Query["file"];
            string fileType = req.Query["fileType"];

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject(requestBody);
            fileName = fileName ?? data?.name;
            file = file ?? data?.file;
            fileType = fileType ?? data?.fileType;

            var bytes = Convert.FromBase64String(file);
            var contents = new MemoryStream(bytes);

            BlobClient blobClient = containerClient.GetBlobClient(fileName);
            var response = await blobClient.UploadAsync(contents, new BlobHttpHeaders { ContentType = fileType });

            return new OkObjectResult(response.Value);
        }
    }
}
