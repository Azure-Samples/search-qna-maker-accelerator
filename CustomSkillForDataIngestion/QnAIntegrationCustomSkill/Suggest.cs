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
using System.Collections.Generic;
using Azure.Search.Documents.Models;
using System.Linq;

namespace QnAIntegrationCustomSkill
{
    public static class Suggest
    {
        private static string searchApiKey = Environment.GetEnvironmentVariable("SearchServiceApiKey", EnvironmentVariableTarget.Process);
        private static string searchServiceName = Environment.GetEnvironmentVariable("SearchServiceName", EnvironmentVariableTarget.Process);
        private static string searchIndexName = Constants.indexName;

        // Create a SearchIndexClient to send create/delete index commands
        private static Uri serviceEndpoint = new Uri($"https://{searchServiceName}.search.windows.net/");
        private static AzureKeyCredential credential = new AzureKeyCredential(searchApiKey);

        // Create a SearchClient to load and query documents
        private static SearchClient searchClient = new SearchClient(serviceEndpoint, searchIndexName, credential);

        [FunctionName("Suggest")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            string q = req.Query["q"];
            string top = req.Query["top"];
            string suggester = req.Query["suggester"];

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject(requestBody);
            q = q ?? data?.q;
            top = top ?? data?.top;
            suggester = suggester ?? data?.suggester;

            AutocompleteOptions options = new AutocompleteOptions()
            {
                Size = int.Parse(top)
            };

            var response = await searchClient.AutocompleteAsync(q, suggester, options);

            var output = new Dictionary<string, List<AutocompleteItem>>();

            output["suggestions"] = response.Value.Results.ToList();
            return new OkObjectResult(output);
        }
    }
}
