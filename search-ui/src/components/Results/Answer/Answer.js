import React from 'react';
import ReactMarkdown from 'react-markdown';

import './Answer.css';


export default function Answer(props) {

    // const cardStyle = {
    //     maxHeight: '28rem'
    // };

    const bodyStyle = {
        padding: '0.25rem'
    };


    return (
        <div className="card answer row" >
            <div className="card-body" style={bodyStyle}>
                <h6 className="title-style">{props.data.questions[0]}</h6>
                <p>
                    {/* {props.data.answer} */}
                    <ReactMarkdown>{props.data.answer}</ReactMarkdown>
                </p>
                <footer className="blockquote-footer">{props.data.source}</footer>
            </div>

        </div>
    );
}
