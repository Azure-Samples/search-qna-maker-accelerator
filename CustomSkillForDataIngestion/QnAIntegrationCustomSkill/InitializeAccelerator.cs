using Azure;
using Azure.Search.Documents.Indexes;
using Azure.Search.Documents.Indexes.Models;
using Azure.Storage.Blobs;
using Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.CognitiveServices.Knowledge.QnAMaker;
using Microsoft.Azure.CognitiveServices.Knowledge.QnAMaker.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;


namespace AzureCognitiveSearch.QnAIntegrationCustomSkill
{
    public static class InitializeAccelerator
    {
        private static HttpClient httpClient = new HttpClient();
        // initializes the accelerator solution. 
        [FunctionName("init-accelerator")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", Route = null)] HttpRequest req,
            ILogger log, ExecutionContext executionContext)
        {
            var storageConnectionString = GetAppSetting("AzureWebJobsStorage");
            string functionCode;
            var queryStrings = req.GetQueryParameterDictionary();
            queryStrings.TryGetValue("code", out functionCode);
            var searchServiceEndpoint = $"https://{GetAppSetting("SearchServiceName")}.search.windows.net/";
            var basePath = Path.Join(executionContext.FunctionAppDirectory, "Assets");
            string responseMessage;

            try
            {
                await CreateContainer(storageConnectionString, log);
                await CreateDataSource(storageConnectionString, searchServiceEndpoint, basePath, log);
                await CreateIndex(searchServiceEndpoint, log);
                await CreateSkillSet(searchServiceEndpoint, basePath, functionCode, log);
                await CreateIndexer(searchServiceEndpoint, basePath, log);

                responseMessage = "Initialized accelerator successfully.";
            }
            catch (Exception e)
            {
                responseMessage = "Failed to initialize accelerator " + e.Message;
            }

            return new OkObjectResult(responseMessage);
        }


        private static async Task CreateContainer(string connectionString, ILogger log)
        {
            try
            {
                log.LogInformation("init-accelerator: Creating container " + Constants.containerName);

                BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);
                await blobServiceClient.CreateBlobContainerAsync(Constants.containerName);
                await blobServiceClient.CreateBlobContainerAsync(Constants.kbContainerName);

            }
            catch (Exception e)
            {
                log.LogError("init-accelerator: container creation failed " + e.Message);
                throw new Exception(e.Message);
            }
        }

        private static async Task CreateDataSource(string storageConnection, string searchServiceEndpoint, string basePath, ILogger log)
        {
            log.LogInformation("init-accelerator: Creating data source " + Constants.dataSourceName);

            try
            {
                string uri = string.Format("{0}/datasources/{1}?api-version={2}", searchServiceEndpoint, Constants.dataSourceName, Constants.apiVersion);
                var path = Path.Combine(basePath, "DataSource.json");
                using (StreamReader r = new StreamReader(path))
                {
                    var body = r.ReadToEnd();
                    body = body.Replace("{{datasourcename}}", Constants.dataSourceName);
                    body = body.Replace("{{connectionString}}", storageConnection);
                    body = body.Replace("{{containerName}}", Constants.containerName);

                    var response = await Put(uri, body);
                    if (response.StatusCode != HttpStatusCode.Created)
                    {
                        var responseBody = await response.Content.ReadAsStringAsync();
                        log.LogError("init-accelerator: error while creating data source " + responseBody);
                        throw new Exception(responseBody);
                    }

                }
            }
            catch (Exception e)
            {
                log.LogError("init-accelerator: error while creating data source " + e.Message);
                throw new Exception(e.Message);
            }
        }

        private static async Task CreateIndex(string searchServiceEndpoint, ILogger log)
        {
            log.LogInformation("init-accelerator: Creating index " + Constants.indexName);
            try
            {
                var idxclient = new SearchIndexClient(new Uri(searchServiceEndpoint), new AzureKeyCredential(GetAppSetting("SearchServiceApiKey")));
                SearchIndex index = new SearchIndex(Constants.indexName)
                {
                    Fields =
                {
                    new SearchField("content", SearchFieldDataType.String) { IsSearchable = true, IsSortable = false, IsFilterable = false, IsFacetable = false},
                    new SearchField("metadata_storage_path", SearchFieldDataType.String) { IsSearchable = true, IsSortable = false, IsFilterable = false, IsFacetable = false },
                    new SearchField("id", SearchFieldDataType.String) { IsKey = true, IsSearchable = true, IsSortable = false, IsFilterable = false, IsFacetable = false },
                    new SearchField("metadata_storage_name", SearchFieldDataType.String) { IsSearchable = true, IsSortable = false, IsFilterable = false, IsFacetable = false },
                    new SearchField("status", SearchFieldDataType.String) { IsSearchable = false, IsSortable = false, IsFilterable = false, IsFacetable = false },
                    new SearchField("fileType", SearchFieldDataType.String) { IsSearchable = true, IsSortable = false, IsFilterable = true, IsFacetable = true },
                    new SearchField("keyPhrases", SearchFieldDataType.Collection(SearchFieldDataType.String)) { IsSearchable = true, IsSortable = false, IsFilterable = true, IsFacetable = true }
                }
                };

                var suggester = new SearchSuggester("sg", new[] { "keyPhrases" });
                index.Suggesters.Add(suggester);


                await idxclient.CreateIndexAsync(index);
            }
            catch (Exception e)
            {
                log.LogError("init-accelerator: Error while creating index " + e.Message);
                throw new Exception(e.Message);
            }
        }

        private static async Task CreateSkillSet(string searchServiceEndpoint, string basePath, string functionCode, ILogger log)
        {
            log.LogInformation("init-accelerator: Creating Skill Set " + Constants.skillSetName);
            try
            {
                string uri = string.Format("{0}/skillsets/{1}?api-version={2}", searchServiceEndpoint, Constants.skillSetName, Constants.apiVersion);
                var path = Path.Combine(basePath, "SkillSet.json");
                using (StreamReader r = new StreamReader(path))
                {
                    var body = r.ReadToEnd();
                    body = body.Replace("{{skillset-name}}", Constants.skillSetName);
                    body = body.Replace("{{function-name}}", GetAppSetting("WEBSITE_SITE_NAME"));
                    body = body.Replace("{{function-code}}", functionCode);
                    body = body.Replace("{{cog-svc-allinone-key}}", GetAppSetting("CogServicesKey"));

                    var response = await Put(uri, body);
                    if (response.StatusCode != HttpStatusCode.Created)
                    {
                        var responseBody = await response.Content.ReadAsStringAsync();
                        log.LogError("init-accelerator: Error while creating skill set " + responseBody);
                        throw new Exception(responseBody);
                    }

                }
            }
            catch (Exception e)
            {
                log.LogError("init-accelerator: Error while creating skill set " + e.Message);
                throw new Exception(e.Message);
            }

        }

        private static async Task CreateIndexer(string searchServiceEndpoint, string basePath, ILogger log)
        {
            log.LogInformation("init-accelerator: Creating indexer " + Constants.indexerName);
            try
            {
                string uri = string.Format("{0}/indexers/{1}?api-version={2}", searchServiceEndpoint, Constants.indexerName, Constants.apiVersion);
                var path = Path.Combine(basePath, "Indexer.json");
                using (StreamReader r = new StreamReader(path))
                {
                    var body = r.ReadToEnd();
                    body = body.Replace("{{indexer-name}}", Constants.indexerName);
                    body = body.Replace("{{index-name}}", Constants.indexName);
                    body = body.Replace("{{datasource-name}}", Constants.dataSourceName);
                    body = body.Replace("{{skillset-name}}", Constants.skillSetName);

                    var response = await Put(uri, body);
                    if (response.StatusCode != HttpStatusCode.Created)
                    {
                        var responseBody = await response.Content.ReadAsStringAsync();
                        log.LogError("init-accelerator: Error while creating indexer " + responseBody);
                        throw new Exception(responseBody);
                    }

                }
            }
            catch (Exception e)
            {
                log.LogError("init-accelerator: Error while creating indexer " + e.Message);
                throw new Exception(e.Message);
            }

        }


        private static async Task<HttpResponseMessage> Put(string uri, string body)
        {
            var key = GetAppSetting("SearchServiceApiKey");
            using (var request = new HttpRequestMessage())
            {
                request.Method = HttpMethod.Put;
                request.RequestUri = new Uri(uri);

                if (!string.IsNullOrEmpty(body))
                {
                    request.Content = new StringContent(body, Encoding.UTF8, "application/json");
                }

                request.Headers.Add("api-key", $"{key}");
                request.Headers.Add("content", "application/json");

                var response = await httpClient.SendAsync(request);
                return response;
            }
        }

        private static string GetAppSetting(string key)
        {
            return Environment.GetEnvironmentVariable(key, EnvironmentVariableTarget.Process);
        }
    }
}
