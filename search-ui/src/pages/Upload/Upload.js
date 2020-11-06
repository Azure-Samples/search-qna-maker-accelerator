import React, { useState } from "react";

import "./Upload.css";

export default function Upload() {

  const [filePath, setFilePath] = useState("");

  function onFileChange(event) {
    let path = event.target.value;

    // getting just the filename from the path
    var fileName = path.split('\\').pop();

    setFilePath(fileName);
  }

  function onUploadClick() {

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
        <p className="file-name">{filePath}</p>

      </div>
      <br />
      <button className="btn btn-primary rounded-0">Upload Document</button>
    </main>
  );
};
