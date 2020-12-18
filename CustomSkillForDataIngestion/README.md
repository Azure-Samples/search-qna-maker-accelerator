# A single endpoint for Search + QnA

A single endpoint can be created to call both Azure Cognitive Search and QnA Maker. This document describes the input and output of the `/api/search` endpoint that serves as a single endpoint.

## Inputs

```json
{
    "q": "what are covid symptoms?",
    "top": 10,
    "skip": 0,
    "filters": [],
    "getAnswer": true
}
```

Note: in the current setup, facet to include in the query are pulled from the Azure Function App Settings so they are not included as an input here.

## Outputs

Below is a sample output from the call above. The output has been abbreviated for readability.

```json
{
  "count": 54,
  "results": [
    {
      "score": 4.895756,
      "highlights": {
        "content": [
          "What are the <em>symptoms</em> of <em>COVID</em>-19?",
          "Are the <em>symptoms</em> of <em>COVID</em>-19 different in children than in adults?",
          "Until when should I wear a mask after recovering from an illness with respiratory\n<em>symptoms</em>?",
          "Can I catch the virus from being in an enclosed space (i.e. bus, subway) in close proximity\nto someone who doesn’t have respiratory <em>symptoms</em>?",
          "I\nam well and have no <em>symptoms</em>."
        ]
      },
      "document": {
        "content": "\nCOVID-19 Response\n\nHome Secretary-General Stories UN News For UN Personnel....",
        "metadata_storage_path": "https://dqnastoragen74w2pwcgwlii.blob.core.windows.net/covid-docs/UN%20Dataset.pdf",
        "id": "aHR0cHM6Ly9kcW5hc3RvcmFnZW43NHcycHdjZ3dsaWkuYmxvYi5jb3JlLndpbmRvd3MubmV0L2NvdmlkLWRvY3MvVU4lMjBEYXRhc2V0LnBkZg2",
        "metadata_storage_name": "UN Dataset.pdf",
        "status": "InQueue",
        "keyPhrases": [
          "symptoms of COVID",
          "cure COVID",
          "local transmission of COVID",
          "virus",
          "respiratory symptoms"
        ],
        "fileType": ".pdf"
      }
      ...
      ...
    }
  ],
  "facets": {
    "fileType": [
      {
        "count": 26,
        "value": ".html"
      },
      {
        "count": 26,
        "value": ".pdf"
      },
      {
        "count": 2,
        "value": ".txt"
      }
    ]
  },
  "answers": [
    {
      "questions": [
        "What are the symptoms?"
      ],
      "answer": "People with COVID-19 have had a wide range of symptoms reported – ranging from mild symptoms to severe illness. Symptoms may appear 2-14 days after exposure to the virus.\n\nOther symptoms:\n\nFever Cough Difficulty breathing\n\n• Chills\n\n• Muscle Pain\n\n• Sore throat\n\n• New loss of taste or smell",
      "score": 80.5,
      "id": 1442,
      "source": "novel-coronavirus-factsheet.pdf",
      "metadata": [],
      "context": {
        "isContextOnly": false,
        "prompts": []
      }
    }
  ]
}
```