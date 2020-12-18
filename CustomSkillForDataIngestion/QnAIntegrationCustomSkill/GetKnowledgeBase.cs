using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Azure.Storage.Blobs;
using Common;
using Azure.Storage.Blobs.Models;

namespace QnAIntegrationCustomSkill
{
    

    public static class GetKnowledgeBase
    {
        
        private static BlobServiceClient blobServiceClient = new BlobServiceClient(Environment.GetEnvironmentVariable("AzureWebJobsStorage", EnvironmentVariableTarget.Process));

        [FunctionName("GetKb")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            string kbId = await GetKbId(log);

            GetKbOutput output = new GetKbOutput()
            {
                QnAMakerKnowledgeBaseID = kbId
            };

            return new OkObjectResult(output);
        }

        private static async Task<string> GetKbId(ILogger log)
        {
            string kbId = string.Empty;
            var path = Path.Join(Environment.GetEnvironmentVariable("HOME", EnvironmentVariableTarget.Process), Constants.qnamakerFolderPath);
            var filePath = Path.Join(path, Constants.kbIdBlobName + ".txt");
            // Check for kbid in local file system
            if (File.Exists(filePath))
            {
                kbId = File.ReadAllText(filePath);
            }
            else
            {
                BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient(Constants.kbContainerName);
                BlobClient kbidBlobClient = containerClient.GetBlobClient(Constants.kbIdBlobName);
                // Check blob for kbid 
                if (await kbidBlobClient.ExistsAsync())
                {
                    BlobDownloadInfo download = await kbidBlobClient.DownloadAsync();
                    using (var streamReader = new StreamReader(download.Content))
                    {
                        while (!streamReader.EndOfStream)
                        {
                            kbId = await streamReader.ReadLineAsync();
                        }
                    }
                }

            }
            return kbId;
        }
    }
}
