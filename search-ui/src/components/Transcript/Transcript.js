import React from 'react'


import './Transcript.css';


export default function Transcript(props) {

    
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

    const overflow = {
        overflowX: 'auto'
    };

    const halfWidth = {
        width: '50%'
    };

    console.log(full_content);

    if (!!props.document.translated_text && props.document.translated_text !== null && props.document.language !== "en") {
        return (
            <div style={overflow}>
                <table className="table table-hover table-striped table-bordered">
                    <thead>
                        <tr>
                            <th>Original Content</th>
                            <th>Translated (En)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="wrapword" style={halfWidth}>
                                <pre id="transcript-viewer-pre">{full_content}</pre>
                            </td>
                            <td className="wrapword">
                                <pre>{props.document.translated_text.trim()}</pre>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
    else {
        return (
            <div style={overflow}>
                <table className="table table-hover table-striped table-bordered">
                    <tbody>
                        <tr>
                            <td className="wrapword">
                                <pre id="transcript-viewer-pre">{full_content}</pre>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}