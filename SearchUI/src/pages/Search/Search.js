import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useLocation, useHistory } from "react-router-dom";

import Results from '../../components/Results/Results';
import Pager from '../../components/Pager/Pager';
import Facets from '../../components/Facets/Facets';
import SearchBar from '../../components/SearchBar/SearchBar';

import "./Search.css";

export default function Search() {

  let location = useLocation();
  let history = useHistory();

  const [answer, setAnswer] = useState({});
  const [results, setResults] = useState([]);
  const [resultCount, setResultCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [q, setQ] = useState(new URLSearchParams(location.search).get('q') ?? "*");
  const [top] = useState(new URLSearchParams(location.search).get('top') ?? 8);
  const [skip, setSkip] = useState(new URLSearchParams(location.search).get('skip') ?? 0);
  const [filters, setFilters] = useState([]);
  const [facets, setFacets] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  let resultsPerPage = top;

  useEffect(() => {
    setIsLoading(true);
    setSkip((currentPage - 1) * top);
    const body = {
      q: q,
      top: top,
      skip: skip,
      filters: filters,
      // only return answer on first page
      getAnswer: currentPage === 1 ? true : false
    };

    const headers = {
      "x-functions-key": process.env.REACT_APP_FUNCTION_CODE
    };

    const url = process.env.REACT_APP_FUNCTION_URL + '/api/search';
    axios.post(url, body, {headers: headers})
      .then(response => {
        setResults(response.data.results);
        setFacets(response.data.facets);
        setResultCount(response.data.count);

        if (currentPage === 1) {
          setAnswer(response.data.answers);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
      });

      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [top, skip, filters, currentPage]);

  // pushing the new search term to history when q is updated
  // allows the back button to work as expected when coming back from the details page
  useEffect(() => {
    history.push('/search?q=' + q);
    setCurrentPage(1);
    setFilters([]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);


  let postSearchHandler = (searchTerm) => {
    //console.log(searchTerm);
    setQ(searchTerm);
  }



  var body;
  if (isLoading) {
    body = (
      <div className="col-md-9">
        <CircularProgress />
      </div>);
  } else {
    body = (
      <div className="col-md-9">
        <Results documents={results} answer={answer} top={top} skip={skip} count={resultCount}></Results>
        <Pager className="pager-style" currentPage={currentPage} resultCount={resultCount} resultsPerPage={resultsPerPage} setCurrentPage={setCurrentPage}></Pager>
      </div>
    )
  }

  return (
    <main className="main main--search container-fluid">

      <div className="row">
        <div className="col-md-3">
          <div className="search-bar">
            <SearchBar postSearchHandler={postSearchHandler} q={q}></SearchBar>
          </div>
          <Facets facets={facets} filters={filters} setFilters={setFilters}></Facets>
        </div>
        {body}
      </div>
    </main>
  );
}


