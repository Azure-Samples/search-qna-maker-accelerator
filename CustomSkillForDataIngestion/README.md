# A single endpoint for Search + QnA

A single endpoint can be created to call both Azure Cognitive Search and QnA Maker. This document describes the input and output of the `/api/search` endpoint that serves as a single endpoint.

## Inputs

```json
{
    "q": "how do mrna vaccines work?",
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
  "count":11,
   "results":[
      {
         "score":7.169414,
         "highlights":{
            "content":[
               "For more information: www.cdc.gov/COVID19\n\nWhat Clinicians Need to Know About the \n\nPfizer-BioNTech COVID-19 Vaccine\n\nAmanda Cohn, MD\n\nSarah Mbaeyi, MD, MPH\n\nDecember 13, 2020\n\n\n\n2\n\nPfizer-BioNTech COVID-19 Vaccine\n\n\n\n Lipid nanoparticle-formulated <em>mRNA</em> vaccine \n\nencoding the spike protein\n\n– Spike protein: facilitates entry of virus into cells\n\n Vaccination induces antibodies that can block entry \n\nof SARS-CoV-2 into cells, thereby preventing \n\ninfection\n\n FDA issued an Emergency Use Authorization on \n\nDecember 13, 2020 for use in persons aged ≥16 \n\nyears\n\nPfizer-BioNTech COVID-19 vaccine\n\nSpike protein\n\n3\n\n\n\n <em>mRNA</em> <em>vaccines</em> take advantage of the process that cells use to make proteins in \n\norder to trigger an immune response \n\n– Like all <em>vaccines</em>, COVID-19 <em>mRNA</em> <em>vaccines</em> have been rigorously tested for \n\nsafety before being authorized for use in the United States\n\n– <em>mRNA</em> technology is new, but not unknown."
            ]
         },
         "document":{
            "metadata_storage_path":"https://q2storage7nzzkuzdcevvy.blob.core.windows.net/qna-container/pfizer-biontech-vaccine-what-Clinicians-need-to-know.pdf",
            "id":"aHR0cHM6Ly9xMnN0b3JhZ2U3bnp6a3V6ZGNldnZ5LmJsb2IuY29yZS53aW5kb3dzLm5ldC9xbmEtY29udGFpbmVyL3BmaXplci1iaW9udGVjaC12YWNjaW5lLXdoYXQtQ2xpbmljaWFucy1uZWVkLXRvLWtub3cucGRm0",
            "metadata_storage_name":"pfizer-biontech-vaccine-what-Clinicians-need-to-know.pdf"
         }
      }
      ...
      ...
  ],
 "facets":{
      "keyPhrases":[
         {
            "value":"COVID",
            "count":8
         },
         {
            "value":"Asked Questions",
            "count":5
         },
         {
            "value":"CDC",
            "count":5
         }
      ],
      "fileType":[
         {
            "value":".pdf",
            "count":8
         },
         {
            "value":".docx",
            "count":3
         }
      ]
   },
  "answers":{
      "answer":{
         "questions":[
            "How do the Pfizer and Moderna mRNA vaccines work?"
         ],
         "answer":"The vaccines contain synthetic mRNA, which is genetic information used to make the SARS-CoV-2 spike protein. The spike protein is the part of the virus that attaches to human cells. The spike protein alone cannot cause COVID-19. Once the spike protein is created it causes the immune system to make antibodies against the virus. These antibodies can the provide protection if a person comes into contact with the virus.",
         "score":95.0,
         "id":19,
         "source":"COVID-19 Vaccine FAQ.pdf",
         "metadata":[
            
         ],
         "context":{
            "isContextOnly":false,
            "prompts":[
               
            ]
         }
      },
      "document":{
         "score":4.249519,
         "highlights":{
            "content":[
               "How do the Pfizer and Moderna <em>mRNA</em> <em>vaccines</em> <em>work</em>?",
               "The <em>vaccines</em> contain synthetic <em>mRNA</em>, which is genetic information used to make the SARS-CoV-2 spike protein.",
            ]
         },
         "document":{
            "metadata_storage_path":"https://q2storage7nzzkuzdcevvy.blob.core.windows.net/qna-container/COVID-19%20Vaccine%20FAQ.pdf",
            "id":"aHR0cHM6Ly9xMnN0b3JhZ2U3bnp6a3V6ZGNldnZ5LmJsb2IuY29yZS53aW5kb3dzLm5ldC9xbmEtY29udGFpbmVyL0NPVklELTE5JTIwVmFjY2luZSUyMEZBUS5wZGY1",
            "metadata_storage_name":"COVID-19 Vaccine FAQ.pdf"
         }
      }
  }
}
```