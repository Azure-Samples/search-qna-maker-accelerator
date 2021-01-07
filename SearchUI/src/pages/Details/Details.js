import React, { useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import Transcript from '../../components/Transcript/Transcript';
import DocumentViewer from '../../components/DocumentViewer/DocumentViewer';
import ReactHtmlParser from 'react-html-parser';
import axios from 'axios';
import "./Details.css";

export default function Details() {

  let { id } = useParams();
  const [document, setDocument] = useState({});
  const [sasToken, setSasToken] = useState("");
  const [selectedTab, setTab] = useState(0);
  const [highlight, setHighlight] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState("");
  const searchBar = useRef(null);

  useEffect(() => {
    setIsLoading(true);

    const headers = {
      "x-functions-key": process.env.REACT_APP_FUNCTION_CODE
    };

    const url = process.env.REACT_APP_FUNCTION_URL + '/api/lookup?id=' + id;
    console.log(url);
    axios.get(url, {headers: headers})
      .then(response => {
        const doc = response.data.document;
        const sas = response.data.sasToken;
        setDocument(doc);
        setSasToken(sas);
        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
      });

  }, [id]);

  useEffect(() => {
    setHighlight(null);
  }, [q]);

  function GetTagsHTML(tags) {

    if (!!tags) {
      let tagsHtml = tags.map((tagValue, index) => {
        if (index < 10) {

          if (tagValue.length > 30) { // check tag name length
            // create substring of tag name length if too long
            tagValue = tagValue.slice(0, 30);
          }

          return <button key={index} className="tag" onClick={() => setQ(tagValue)}>{tagValue}</button>;
        } else {
          return null;
        }
      });

      return tagsHtml;
    }

    return null;
  }

  let tags = GetTagsHTML(document.keyPhrases);

  function GetSnippets(q, content) {
    if (!!content && q.trim() !== "") {
      var regex = new RegExp(q, 'gi');

      let matches = content.match(regex);

      return matches.map((value, index) => {
        var startIdx;
        var maxLengthOfSnippet = 400;
        var ln = maxLengthOfSnippet;

        if (value.length > 150) {
          startIdx = content.indexOf(value);
          ln = value.length;
        }
        else {
          if (content.indexOf(value) < (maxLengthOfSnippet / 2)) {
            startIdx = 0;
          }
          else {
            startIdx = content.indexOf(value) - (maxLengthOfSnippet / 2);
          }

          ln = maxLengthOfSnippet + value.length;
        }

        var reference = content.slice(startIdx, startIdx + ln);
        content = content.replace(value, "");

        reference = reference.replace(value, function (str) {
          return (`<span class="highlight">${str}</span>`);
        });

        var shortName = value.slice(0, 20).replace(/[^a-zA-Z ]/g, " ").replace(new RegExp(" ", 'g'), "_");

        return <li key={index}className='reference list-group-item' onClick={() => ClickSnippet(`${index}_${shortName}`)}>{ReactHtmlParser(reference)}</li>;

      });
    }
  }

  let snippets = GetSnippets(q, document.content);

  function ClickSnippet(name) {
    // navigating to the transcript
    setTab(1);
    setHighlight(name);
  }

  var body;
  let tab_0_style = "nav-link black";
  let tab_1_style = "nav-link black";
  let tab_2_style = "nav-link black";
  if (isLoading) {
    body = (<CircularProgress />);
  } else {
    if (selectedTab === 0) {
      body = (<DocumentViewer document={document} sasToken={sasToken}></DocumentViewer>);
      tab_0_style = "nav-link active black";
    }
    else if (selectedTab === 1) {
      body = (<Transcript document={document} q={q} highlight={highlight}></Transcript>);
      tab_1_style = "nav-link active black";
    }
    else if (selectedTab === 2) {
      body = <div className="card-body text-left">
        <pre>
          <code>{JSON.stringify(document, null, 2)}</code>
        </pre>
      </div>;
      tab_2_style = "nav-link active black";
    }

  }



  return (
    <div className="main main--details">
      <div id="details" className="text-center ">
        <div >
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button className={tab_0_style} onClick={() => setTab(0)}>Document</button>
            </li>
            <li className="nav-item">
              <button className={tab_1_style} onClick={() => setTab(1)}>Transcript</button>
            </li>
            <li className="nav-item">
              <button className={tab_2_style} onClick={() => setTab(2)}>Raw Data</button>
            </li>
          </ul>
        </div>
        <div className="row result-container">
          <div id="content-viewer" className="col-md-8">
            {body}
          </div>

          <div id="tags-panel" className="col-md-4">
            <div >
              <div id="transcript-search-box" >
                <div className="input-group">
                  <input
                    autoComplete="off" // setting for browsers; not the app
                    type="text"
                    id="search-box"
                    className="form-control rounded-0"
                    placeholder="Search within this document..."
                    ref={searchBar}
                  >
                  </input>
                  <div className="input-group-btn">
                    <button className="btn btn-primary rounded-0" type="submit" onClick={() => setQ(searchBar.current.value)} >
                      Search
                    </button>
                  </div>
                </div>
              </div>
              <div id="tags-container" className="tag-container">
                {tags}
              </div>
              <hr />
              <div id="reference-viewer">
                {snippets}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

