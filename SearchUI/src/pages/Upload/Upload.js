import React, { useState } from "react";
import axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress';

import "./Upload.css";

export default function Upload() {

  const [file, setFile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  function onFileChange(event) {
    let selectedFile = event.target.files[0];
    console.log(selectedFile);
    setFile(selectedFile);

    setIsError(false);
    setIsSuccess(false);
  }

  async function onUploadClick() {
    setIsLoading(true);
    setIsError(false);
    setIsSuccess(false);

    var reader = new FileReader();

    reader.onload = function () {
      let base64File = reader.result.replace(/^data:.+;base64,/, '');


      let body = {
        name: file.name,
        file: base64File,
        fileType: file.type
      }

      const headers = {
        "x-functions-key": process.env.REACT_APP_FUNCTION_CODE
      };

      const url = process.env.REACT_APP_FUNCTION_URL + '/api/upload';
      axios.post(url, body, {headers: headers})
        .then(response => {
          setIsLoading(false);
          setIsSuccess(true);
        })
        .catch(error => {
          console.log(error);
          setIsLoading(false);
          setIsError(true);
        });

      console.log(body);
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };

    reader.readAsDataURL(file);

  }

  var loading;
  if (isLoading) {
    loading = (<CircularProgress />);
  }

  var successMessage;
  if (isSuccess) {
    successMessage = (<div class="alert alert-success" role="alert">
      Document successfully uploaded!
    </div>);
  }

  var errorMessage;
  if (isError) {
    errorMessage = (<div class="alert alert-danger" role="alert">
      Document upload failed :(
    </div>);
  }

  return (
    <main className="main main--upload">
      <div>
        <h1 className="upload-text lead">Upload a document</h1>
        <p>Use the buttons below to select a file to upload into the solution.</p>
      </div>

      <hr />

      <div className="file-select">
        <label for="file-upload" className="btn btn-outline-primary rounded-0">
          Select File
      </label>
        <input id="file-upload" type="file" onChange={(e) => onFileChange(e)} />
        <p className="file-name">{file.name}</p>

      </div>
      <br />
      <button className="btn btn-primary rounded-0" onClick={onUploadClick}>Upload Document</button>
      {loading}
      <br />
      <br />
      {successMessage}
      {errorMessage}
    </main>
  );
};
