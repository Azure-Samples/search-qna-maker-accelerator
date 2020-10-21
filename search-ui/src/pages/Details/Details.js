import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import Rating from '@material-ui/lab/Rating';
import CircularProgress from '@material-ui/core/CircularProgress';
import Transcript from '../../components/Transcript/Transcript';

import axios from 'axios';

import "./Details.css";

export default function Details() {

  let { id } = useParams();
  const [document, setDocument] = useState({});
  const [selectedTab, setTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    console.log(id);
    axios.get('/api/lookup?id=' + id)
      .then(response => {
        const doc = response.data.document;
        setDocument(doc);
        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
      });

  }, [id]);

  var body;
  if (isLoading) {
    body = (<CircularProgress />);
  } else {
    body = (<div className="card-body">
      <h5 className="card-title">{document.original_title}</h5>
      <img className="image" src={document.image_url} alt="Book cover"></img>
      <p className="card-text">{document.authors?.join('; ')} - {document.original_publication_year}</p>
      <p className="card-text">ISBN {document.isbn}</p>
      <Rating name="half-rating-read" value={parseInt(document.average_rating)} precision={0.1} readOnly></Rating>
      <p className="card-text">{document.ratings_count} Ratings</p>
    </div>)
  }

  if (selectedTab === 0) {
    return (
      <div className="main main--details container fluid">
        <div className="card text-center result-container">
          <div className="card-header">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button className="nav-link active" onClick={() => setTab(0)}>Document</button>
              </li>
              <li className="nav-item">
                <button className="nav-link" onClick={() => setTab(1)}>Transcript</button>
              </li>
              <li className="nav-item">
                <button className="nav-link" onClick={() => setTab(2)}>Raw Data</button>
              </li>
            </ul>
          </div>
          {body}
        </div>
      </div>
    );
  } 
  else if (selectedTab === 1) {
    return (
      <div className="main main--details container fluid">
        <div className="card text-center result-container">
          <div className="card-header">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button className="nav-link" onClick={() => setTab(0)}>Document</button>
              </li>
              <li className="nav-item">
                <button className="nav-link active" onClick={() => setTab(1)}>Transcript</button>
              </li>
              <li className="nav-item">
                <button className="nav-link" onClick={() => setTab(2)}>Raw Data</button>
              </li>
            </ul>
          </div>
          <Transcript document={document}></Transcript>
        </div>
      </div>
    );
  } else {
    return (
      <div className="main main--details container fluid">
        <div className="card text-center">
          <div className="card-header">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button className="nav-link" onClick={() => setTab(0)}>Document</button>
              </li>
              <li className="nav-item">
                <button className="nav-link" onClick={() => setTab(1)}>Transcript</button>
              </li>
              <li className="nav-item">
                <button className="nav-link active" onClick={() => setTab(2)}>Raw Data</button>
              </li>
            </ul>
          </div>
          <div className="card-body text-left">
            <pre><code>{JSON.stringify(document, null, 2)}</code></pre>
          </div>
        </div>
      </div>
    );
  }
}

