// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, {useEffect} from 'react'
import ReactHtmlParser from 'react-html-parser';

import './Transcript.css';


export default function Transcript(props) {


    useEffect(_ =>{
        console.log(props.highlight);
        if (!!props.highlight) {

            let highlightedElement = document.getElementById(props.highlight)
            if (!!highlightedElement) {
                highlightedElement.scrollIntoView({block: 'start', behavior: 'smooth'});
            }
        }
    }, [props]);


    let full_content = "";

    // If we have merged content, let's use it.
    if (props.document.merged_content) {
        if (props.document.merged_content.length > 0) {
            full_content = props.document.merged_content.trim();
        }
    }
    else {
        // otherwise, let's try getting the content -- although it won't have any image data.
        full_content = props.document.content.trim();
    }

    if (full_content === null || full_content === "") {
        // not much to display
        return null;
    }

    // finds all matches to the search term in the transcript and adds a highlight class to them (plus an id that can be used for scrolling)
    function GetReferences(searchText, content) {
        // find all matches in content
        var regex = new RegExp(searchText, 'gi');

        var i = -1;
        var response = content.replace(regex, function (str) {
          i++;
          var shortname = str.slice(0, 20).replace(/[^a-zA-Z ]/g, " ").replace(new RegExp(" ", 'g'), "_");
          return `<span id='${i}_${shortname}' class="highlight">${str}</span>`;
      })

      return response;
  }


  if (props.q.trim() !== "") {
    full_content = GetReferences(props.q, full_content);
  }
  

    return (
        <div className="scroll">
            <table className="table table-hover table-striped table-bordered scroll">
                <tbody >
                    <tr>
                        <td className="wrapword">
                            <pre id="transcript-viewer-pre">{ReactHtmlParser(full_content)}</pre>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}