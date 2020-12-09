# Cognitive Search Question Answering Solution Accelerator
An integrated search solution leveraging [Azure Cognitive Search](https://azure.microsoft.com/services/search/) and [QnA Maker](https://www.qnamaker.ai/) to provide instant answers to common questions.

![Screenshot of sample web app](./images/web-app.png)

This solution accelerator leverages the power of Azure Cognitive Search together with QnA Maker to find answers to your questions in a similar way to how Bing and Google suggest relevant answers to queries.  

Ordinarily, Azure Cognitive Search returns the most relevant documents for your search query but together with QnA Maker integration, it can not only find the most relevant documents but also pull questions and answers out of the document and suggest the most relevant answers.  

Please note that not all documents support the [question/answer format required by QnA Maker](https://docs.microsoft.com/azure/cognitive-services/qnamaker/concepts/data-sources-and-content#file-and-url-data-types).  

This solution accelerator contains the following artifacts:
+ ARM template to set up the solution
+ Custom skill in Cognitive Search, which ingests the data into QnA Maker
+ User interface to view the results

## Live demo

You can view a live demo of this repo at the following link:

[https://ambitious-tree-00baa321e.azurestaticapps.net](https://ambitious-tree-00baa321e.azurestaticapps.net)

## Prerequisites

+ A GitHub account
+ [Node.js and Git](https://nodejs.org/)
+ [Visual Studio Code](https://code.visualstudio.com) installed
+ [Postman](https://www.getpostman.com/) for making API calls

## Getting started

### 1. Deploy Resources

The services and components needed for the solution are packaged in the repo's [ARM template](./azuredeploy.json). The following resources will be deployed:

1. Azure Cognitive Search
2. QnA Maker Cognitive Service
3. Azure App Service, App Service Plan
4. Azure App Service, Website
5. Storage Account
6. Azure Function App
7. Cognitive Services All-in-one resource

Click the **Deploy to Azure** button to get started. 

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fjennifermarsman%2Fcognitive-search-qna-solution%2Fmain%2Fazuredeploy.json)

The deployment may take several minutes. Once the deployment finishes, navigate over to the **Outputs** tab:

![Deployment screenshot](./images/deployment.png)

Copy the value of the HTTP Trigger. You'll use this value in the next step.

![URL to copy](./images/qna-copy-url.png)


### 2. Initialize the solution

Open up a new browser tab and paste the URL into the browser. This will run for about a minute and then you'll see a message indicating success or failure.

![Initalize solution accelerator](./images/initialize-accelerator.png)

### 3. Upload documents

Navigate to the storage account in the resource group you just created. Find the container named `qna-container` and upload your documents into the container.

### 4. Set up the UI

With the search index created, you're ready to spin up the UI to start searching! The UI is a React based [Azure Static Web App](https://azure.microsoft.com/services/app-service/static/) available in the `SearchUI` folder.

Navigate to [**SearchUI/README.md**](search-ui/README.md) for full details on how to create, edit, and use the web app. 

Within a few minutes, you'll have a UI with a search experience that looks like this:

![Screenshot of sample web app](./images/search-results.png)

## Data
The data we used to test with [can be found here](https://github.com/JerryWei03/COVID-Q/tree/master/data/PDFs) if you want to reuse it.  Some of these files consistently fail upload to QnAMaker for reasons unknown to me. Make sure if we end up using this for the final demo that [we reference the author](https://github.com/JerryWei03/COVID-Q#citation) and verify the licensing as appropriate.

## To-do

1. [Have the function app use the included hosting plan](https://docs.microsoft.com/azure/azure-functions/functions-scale#app-service-plan) instead of needing to deploy a second one.
    1. I am unsure based on the parameters that QnA uses for the hosting plan for their required web app if we can also tack on the function, so that will need to be investigated/tested. 
    1. You will likely also want to use the same hosting plan for the frontend website to be included with the sample so ideally it would host all 3 resources when it is all said and done.
    1. If we do this, then we can in theory support an unlimited timeout for the queue trigger.  That would need to be tweaked in the host.json file.
    1. Also make sure the function is set to AlwaysOn so that the custom skill works correctly, per the linked documentation.
1. Add cognitive services enrichment skills to skillset/indexer output field mappings/index.
1. Fix [potential race condition](./UploadToQnAMaker.cs#L105) in index status update code.
1. Make the knowledge base id task a bit simpler.
    1. My idea for this is that instead of requiring it be set on the function app settings, pass it as a header to the custom skill. That way the customer just needs to paste it into the Postman collection (or otherwise the frontend once that exists) and it can be passed along to the custom skill/queue trigger execution that way.
1. Better documentation

## Resources
+ [Cognitive Search Documentation](https://docs.microsoft.com/azure/search/)
+ [QnA Maker Documentation](https://docs.microsoft.com/azure/cognitive-services/QnAMaker/)
