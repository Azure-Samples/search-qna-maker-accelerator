import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import Transcript from '../../components/Transcript/Transcript';
import DocumentViewer from '../../components/DocumentViewer/DocumentViewer';

import axios from 'axios';

import "./Details.css";

export default function Details() {

  let { id } = useParams();
  const [document, setDocument] = useState({});
  const [sasToken, setSasToken] = useState("");
  const [selectedTab, setTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    axios.get('/api/lookup?id=' + id)
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

  var body;
  let tab_0_style = "nav-link";
  let tab_1_style = "nav-link";
  let tab_2_style = "nav-link";
  if (isLoading) {
    body = (<CircularProgress />);
  } else {
    if (selectedTab === 0) {
      body = (<DocumentViewer document={document} sasToken={sasToken}></DocumentViewer>);
      tab_0_style = "nav-link active";
    }
    else if (selectedTab === 1) {
      body = (<Transcript document={document}></Transcript>);
      tab_1_style = "nav-link active";
    }
    else if (selectedTab === 2) {
      body = <div className="card-body text-left">
        <pre>
          <code>{JSON.stringify(document, null, 2)}</code>
        </pre>
      </div>;
      tab_2_style = "nav-link active";
    }

  }

  return (
    <div className="main main--details container fluid">
      <div id="details" className="card text-center ">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
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
            <div id="transcript-search-box">
              <div >
                <div className="input-group">
                  <input
                    autoComplete="off" // setting for browsers; not the app
                    type="text"
                    id="search-box"
                    className="form-control rounded-0"
                    placeholder="Search within this document..."
                  // onChange={onChangeHandler} 
                  // defaultValue={props.q}
                  // onClick={() => setShowSuggestions(true)}
                  >
                  </input>
                  <div className="input-group-btn">
                    <button className="btn btn-primary rounded-0" type="submit" >
                      Search
                    </button>
                  </div>
                </div>
              </div>
              <div id="details-viewer"></div>
              <div id="tag-viewer"></div>
              <hr />
              <div id="reference-viewer"></div>
            </div>
            <input id="result-id" type="hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}

