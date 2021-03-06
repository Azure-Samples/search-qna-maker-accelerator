// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';
import ReactMarkdown from 'react-markdown';

import './Answer.css';


export default function Answer(props) {

    const bodyStyle = {
        padding: '0.25rem',
        overflowWrap: 'normal'
    };

    const pStyle = {
        paddingLeft: '0.25rem',
        fontSize: '0.9rem'
    };

    const uriStyle = {
        color: 'green',
        paddingLeft: '0.25rem',
        paddingTop: '0',
        paddingBottom: '0',
        marginTop: '0',
        marginBottom: '0',
        whiteSpace: 'nowrap',
        overflow: 'hidden'
    };

    return (
        <div className="card answer" >
            <div className="card-body" style={bodyStyle}>
                <h6 className="title-style">{props.data.answer.questions[0]}</h6>
                <p>
                    <ReactMarkdown>{props.data.answer.answer}</ReactMarkdown>
                </p>
                <a href={`/details/${props.data.document.document.id}`}>
                    <div style={bodyStyle}>
                        <h6 className="title-style">{props.data.document.document.metadata_storage_name}</h6>
                    </div>
                </a>
                <p style={uriStyle}>{props.data.document.document.metadata_storage_path}</p>
                <p></p>
            </div>
        </div>
    );
}
