import React, {Fragment} from 'react'
import ReactHtmlParser from 'react-html-parser'; 


import './Result.css';


export default function Result(props) {

    const cardStyle = {
        maxHeight: '18rem'
    };
    
    const bodyStyle = {
        padding: '0.25rem'
    };

    return(
    <div className="card result row" style={cardStyle}>
        <a href={`/details/${props.document.metadata_storage_path}`}>
            <div className="card-body" style={bodyStyle}>
                <h6 className="title-style">{props.document.metadata_storage_name}</h6>
            </div>
        </a>
        <p>
                {ReactHtmlParser(props?.highlights?.content[0] || "" )}
        </p>
    </div>
    );
}
