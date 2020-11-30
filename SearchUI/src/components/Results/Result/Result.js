import React from 'react'
import ReactHtmlParser from 'react-html-parser';


import './Result.css';


export default function Result(props) {

    const cardStyle = {
        maxHeight: '18rem',
        display: 'block'
    };

    const bodyStyle = {
        padding: '0.25rem',
        paddingBottom: '0',
        marginBottom: '0'
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
        <div className="result row" style={cardStyle}>
            <a href={`/details/${props.document.id}`}>
                <div style={bodyStyle}>
                    <h6 className="title-style">{props.document.metadata_storage_name}</h6>
                </div>
            </a>
            <p style={uriStyle}>{props.document.metadata_storage_path}</p>
            <p style={pStyle}>
                {ReactHtmlParser(props?.highlights?.content[0] || "")}
            </p>
        </div>
    );
}
