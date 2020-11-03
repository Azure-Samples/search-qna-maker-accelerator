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
    console.log(id);
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
      <div className="card text-center result-container">
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
        {body}
      </div>
    </div>
  );
}

