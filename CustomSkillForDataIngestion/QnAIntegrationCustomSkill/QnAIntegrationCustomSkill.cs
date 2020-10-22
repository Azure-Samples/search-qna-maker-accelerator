// Copyright (c) Microsoft. All rights reserved.  
// Licensed under the MIT License. See LICENSE file in the project root for full license information.  
using Azure.Search.Documents;
using AzureCognitiveSearch.PowerSkills.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.CognitiveServices.Knowledge.QnAMaker;
using Microsoft.Azure.CognitiveServices.Knowledge.QnAMaker.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace AzureCognitiveSearch.QnAIntegrationCustomSkill
{
    public static class UploadToQnAMaker
    {
        [FunctionName("upload-to-qna")]
        public static IActionResult RunUploadToQnaMaker(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            [Queue("upload-to-qna"), StorageAccount("AzureWebJobsStorage")] ICollector<QnAQueueMessage> msg,
            ILogger log,
            ExecutionContext executionContext)
        {
            log.LogInformation("UploadToQnAMaker Custom Skill: C# HTTP trigger function processed a request.");

            string skillName = executionContext.FunctionName;
            IEnumerable<WebApiRequestRecord> requestRecords = WebApiSkillHelpers.GetRequestRecords(req);
            if (requestRecords == null)
            {
                return new BadRequestObjectResult($"{skillName} - Invalid request record array.");
            }

            WebApiSkillResponse response = WebApiSkillHelpers.ProcessRequestRecords(skillName, requestRecords,
                (inRecord, outRecord) =>
                {
                    string id = (inRecord.Data.TryGetValue("id", out object idObject) ? idObject : null) as string;
                    string blobName = (inRecord.Data.TryGetValue("blobName", out object blobNameObject) ? blobNameObject : null) as string;
                    string blobUrl = (inRecord.Data.TryGetValue("blobUrl", out object blobUrlObject) ? blobUrlObject : null) as string;
                    string sasToken = (inRecord.Data.TryGetValue("sasToken", out object sasTokenObject) ? sasTokenObject : null) as string;

                    if (string.IsNullOrWhiteSpace(blobUrl))
                    {
                        outRecord.Errors.Add(new WebApiErrorWarningContract() { Message = $"Parameter '{nameof(blobUrl)}' is required to be present and a valid uri." });
                        return outRecord;
                    }

                    string fileUri = WebApiSkillHelpers.CombineSasTokenWithUri(blobUrl, sasToken);
                    var queueMessage = new QnAQueueMessage
                    {
                        Id = id,
                        FileName = blobName,
                        FileUri = fileUri
                    };
                    msg.Add(queueMessage);

                    outRecord.Data["status"] = "InQueue";
                    return outRecord;
                });

            return new OkObjectResult(response);
        }

        [FunctionName("upload-to-qna-queue-trigger"), Singleton]
        public async static Task Run(
            [QueueTrigger("upload-to-qna", Connection = "AzureWebJobsStorage")] QnAQueueMessage qnaQueueMessage,
            ILogger log)
        {
            log.LogInformation("upload-to-qna-queue-trigger: C# Queue trigger function processed");

            var qnaClient = new QnAMakerClient(new ApiKeyServiceClientCredentials(GetAppSetting("QnAAuthoringKey")))
            {
                Endpoint = $"https://{GetAppSetting("QnAServiceName")}.cognitiveservices.azure.com"
            };

            var updateKB = new UpdateKbOperationDTO
            {
                Delete = new UpdateKbOperationDTODelete
                {
                    Sources = new List<string> { qnaQueueMessage.FileName }
                },
                Add = new UpdateKbOperationDTOAdd
                {
                    Files = new List<FileDTO>
                    {
                        new FileDTO
                        {
                            FileName = qnaQueueMessage.FileName,
                            FileUri = qnaQueueMessage.FileUri
                        }
                    }
                }
            };

            var updateOp = await qnaClient.Knowledgebase.UpdateAsync(GetAppSetting("KnowledgeBaseID"), updateKB);
            updateOp = await MonitorOperation(qnaClient, updateOp, log);

            var searchClient = new SearchClient(
                new Uri($"https://{GetAppSetting("SearchServiceName")}.search.windows.net"),
                "qna-idx",
                new Azure.AzureKeyCredential(GetAppSetting("SearchServiceApiKey")));
            // TODO check to make sure this already exists in the index i.e. the indexer has finished indexed this id
            // so that the indexer doesn't overwrite this status with the InQueue status (avoid race condition with indexer)
            await searchClient.MergeOrUploadDocumentsAsync<IndexDocument>(new List<IndexDocument>
            {
                new IndexDocument
                {
                    id = qnaQueueMessage.Id,
                    status = updateOp.OperationState
                }
            });

            await qnaClient.Knowledgebase.PublishAsync(GetAppSetting("KnowledgeBaseID"));
        }

        // <MonitorOperation>
        private static async Task<Operation> MonitorOperation(IQnAMakerClient qnaClient, Operation operation, ILogger log)
        {
            // Loop while operation is running
            for (int i = 0;
                i < 100 && (operation.OperationState == OperationStateType.NotStarted || operation.OperationState == OperationStateType.Running);
                i++)
            {
                log.LogInformation($"Waiting for operation: {operation.OperationId} to complete.");
                await Task.Delay(5000);
                operation = await qnaClient.Operations.GetDetailsAsync(operation.OperationId);
            }

            if (operation.OperationState != OperationStateType.Succeeded)
            {
                log.LogError($"Operation {operation.OperationId} failed to completed. ErrorMessage: {operation.ErrorResponse.Error.Message}");
            }
            return operation;
        }
        // </MonitorOperation>

        private static string GetAppSetting(string key)
        {
            return Environment.GetEnvironmentVariable(key, EnvironmentVariableTarget.Process);
        }

        public class QnAQueueMessage
        {
            public string Id { get; set; }

            public string FileName { get; set; }

            public string FileUri { get; set; }
        }

        public class IndexDocument
        {
            public string id { get; set; }

            public string status { get; set; }
        }
    }
}