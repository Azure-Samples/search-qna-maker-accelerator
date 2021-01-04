using Azure.Search.Documents.Models;
using Microsoft.Azure.CognitiveServices.Knowledge.QnAMaker.Models;
using Microsoft.Azure.Documents;
using System;
using System.Collections.Generic;
using System.Text;

namespace QnAIntegrationCustomSkill
{
    class SearchOutput
    {
        public long? count { get; set; }
        public List<SearchResult<SearchDocument>> results { get; set; }
        public Dictionary<string, IList<FacetValue>> facets { get; set; }
        public QnAResult answers { get; set; }
    }

    public class QnAResult
    {
        public QnASearchResult answer { get; set; }
        public SearchResult<SearchDocument> document { get; set; }
    }

    public class SearchRequest
    {
        public string q { get; set; }
        public int top { get; set; }
        public int skip { get; set; }
        public bool getAnswer { get; set; }
        public List<SearchFilter> filters { get; set; }
    }

    public class SearchFilter
    {
        public string field { get; set; }
        public string value { get; set; }
    }

    public class LookupOutput
    {
        public string sasToken { get; set; }
        public SearchDocument document { get; set; }

    }

    public class GetKbOutput
    {
        public string QnAMakerKnowledgeBaseID { get; set; }
    }

    public class Facet
    {
        public string key { get; set; }
        public List<FacetValue> value { get; set; }
    }

    public class FacetValue
    {
        public string value { get; set; }
        public long? count { get; set; }
    }
}
