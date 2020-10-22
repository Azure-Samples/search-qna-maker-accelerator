import React from 'react';

import './Answer.css';


export default function Answer(props) {

    const cardStyle = {
        maxHeight: '18rem'
    };

    const bodyStyle = {
        padding: '0.25rem'
    };


    return (
        <div className="card answer row" style={cardStyle}>
            <div className="card-body" style={bodyStyle}>
                <h6 className="title-style">{props.data.questions[0]}</h6>
                <p>
                    {props.data.answer}
                </p>
                <footer class="blockquote-footer">{props.data.source}</footer>
            </div>

        </div>
    );
}
