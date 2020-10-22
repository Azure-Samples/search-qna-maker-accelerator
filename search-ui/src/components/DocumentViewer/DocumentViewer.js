import React from 'react'


import './DocumentViewer.css';


export default function DocumentViewer(props) {

    const path = props.path.toLowerCase();

    if (path.includes('.pdf')) {
        return (
            <object class="file-container" data={path} type="application/pdf">
                <iframe class="file-container" src={path} type="application/pdf">
                    This browser does not support PDFs. Please download the XML to view it: <a href="${path}">Download PDF</a>"
                </iframe>
            </object>
        );
    }
}