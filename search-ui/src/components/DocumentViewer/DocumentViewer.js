import React from 'react'
import ReactHtmlParser from 'react-html-parser';

import './DocumentViewer.css';

export default function DocumentViewer(props) {

    const path = props.document.metadata_storage_path + "?" + props.sasToken;
    const content = props.document.content;


    var fileContainerHTML;
    if (path != null) {
        var pathLower = path.toLowerCase();

        if (pathLower.includes(".pdf")) {
              fileContainerHTML =
                <object className="file-container" data={path} type="application/pdf" width="100%" height="100%">
                    <iframe title="file-viewer" className="file-container" src={path} type="application/pdf" width="100%" height="100%">
                        This browser does not support PDFs. Please download the XML to view it: <a href={path}>Download PDF</a>"
                    </iframe>
                </object>;
        }
        else if (pathLower.includes(".txt") || pathLower.includes(".json")) {
            var txtHtml = content.trim();
            fileContainerHTML = <pre id="file-viewer-pre"> {txtHtml} </pre>;
        }
        else if (pathLower.includes(".las")) {
            fileContainerHTML = 
            <iframe title="file-viewer" width="100%" height="100%" src={path}><p>Your browser does not support iframes.</p></iframe>;
        }
        else if (pathLower.includes(".jpg") || pathLower.includes(".jpeg") || pathLower.includes(".gif") || pathLower.includes(".png")) {
            fileContainerHTML =
                <div className="file-container">
                    <img className="image-style" src={path} alt="the search result"/>
                </div>;
        }
        else if (pathLower.includes(".xml")) {
            fileContainerHTML =
                <iframe title="file-viewer" className="file-container" src={path} type="text/xml">
                    This browser does not support XMLs. Please download the XML to view it: <a href={path}>Download XML</a>"
                </iframe>;
        }
        else if (pathLower.includes(".htm")) {
            fileContainerHTML = <div>{ReactHtmlParser(content)}</div>;
        }
        else if (pathLower.includes(".mp3")) {
            fileContainerHTML =
                <audio controls>
                  <source src={path} type="audio/mp3"/>
                  Your browser does not support the audio tag.
                </audio>;
        }
        else if (pathLower.includes(".mp4")) {
            fileContainerHTML =
                <video controls className="video-result">
                    <source src={path} type="video/mp4"/>
                    Your browser does not support the video tag.
                </video>;
        }
        else if (pathLower.includes(".doc") || pathLower.includes(".ppt") || pathLower.includes(".xls")) {
            var src = "https://view.officeapps.live.com/op/view.aspx?src=" + encodeURIComponent(path);

            fileContainerHTML =
                <iframe title="file-viewer" className="file-container" src={src}></iframe>;
        }
        else {
            fileContainerHTML =
                <div>This file cannot be previewed. Download it here to view: <a href={path}>Download</a></div>;
        }
    }
    else {
        fileContainerHTML =
            <div>This file cannot be previewed or downloaded.</div>;
    }

    return fileContainerHTML;
}