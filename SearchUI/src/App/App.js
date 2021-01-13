import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import axios from 'axios';

// Context for user authentication
import { AuthContext } from '../contexts/AuthContext';

// App shell components
import AppHeader from '../components/AppHeader/AppHeader';
//import AppFooter from '../components/AppFooter/AppFooter';

// React Router page components
import Home from '../pages/Home/Home';
import Search from '../pages/Search/Search';
import Details from '../pages/Details/Details';
import Upload from '../pages/Upload/Upload';

// Bootstrap styles, optionally with jQuery and Popper
import 'bootstrap/dist/css/bootstrap.min.css';

// Custom app styles
import './App.css';

export default function App() {

  // React Hook: useState with a var name, set function, & default value
  const [functionCode, setFunctionCode] = useState("");
  const [functionUrl, setFunctionUrl] = useState("");
  const [user, setUser] = useState({});
  const [knowledgeBaseID, setKnowledgeBaseID] = useState("");

  // Fetch authentication API & set user state
  // async function fetchAuth() {
  //   const response = await fetch("/.auth/me");
  //   if (response) {
  //     const contentType = response.headers.get("content-type");
  //     if (contentType && contentType.indexOf("application/json") !== -1) {
  //       response.json()
  //         .then(response => setUser(response))
  //         .catch(error => console.error('Error:', error));
  //     }
  //   }
  // }

  async function fetchCredentials() {
    const config_url = "/config";
    axios.get(config_url)
      .then(response => {
        console.log(response);
        setFunctionCode(response.data.code);
        setFunctionUrl(response.data.url);

        const headers = {
          "x-functions-key": response.data.code
        };
        
        const url = response.data.url + '/api/getKb';
        axios.get(url, {headers: headers})
          .then(kbResponse => {
            setKnowledgeBaseID(kbResponse.data.qnAMakerKnowledgeBaseID)
          })
          .catch(error => {
            console.log(error);
          });
        
      })
      .catch(error => {
        console.log(error);
      });
  }


  // React Hook: useEffect when component changes
  // Empty array ensure this only runs once on mount
  useEffect(() => {
    //fetchAuth();
      fetchCredentials();
  }, []);

  if (functionUrl !== "") {
    return (
      <AuthContext.Provider value={user}>
        <div className="container-fluid app">
          <AppHeader kbId={knowledgeBaseID} />
          <Router>
            <Switch>
              <Route path="/" exact render={() => <Home code={functionCode} url={functionUrl} />} />
              <Route path="/search" render={() => <Search code={functionCode} url={functionUrl} />} />
              <Route path="/upload" render={() => <Upload code={functionCode} url={functionUrl} />} />
              <Route path="/details/:id" render={() => <Details code={functionCode} url={functionUrl} />} />
            </Switch>
          </Router>
          {/* <AppFooter /> */}
        </div>
      </AuthContext.Provider>
    );
  } else {
    return (
      <CircularProgress />
    );
  }

  
}
