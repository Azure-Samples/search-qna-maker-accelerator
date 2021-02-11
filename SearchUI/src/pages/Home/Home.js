// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from "react";
import { useHistory } from "react-router-dom";

import SearchBar from '../../components/SearchBar/SearchBar';

import "./Home.css";
import "../../pages/Search/Search.css";

export default function Home(props) {
  const history = useHistory();
  const navigateToSearchPage = (q) => {
    if (!q || q === '') {
      q = '*'
    }
    history.push('/search?q=' + q);
  }

  return (
    <main className="main main--home">
      <div className="row home-search">
        <img className="logo" src="/images/search-and-qna.png" alt="Cognitive Search and QnA Maker"></img>
        <p className="poweredby lead">Powered by Azure Cognitive Search and QnA Maker</p>
        <SearchBar postSearchHandler={navigateToSearchPage} code={props.code} url={props.url}></SearchBar>
      </div>
    </main>
  );
};
