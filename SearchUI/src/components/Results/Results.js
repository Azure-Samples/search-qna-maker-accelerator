import React from 'react';
import Result from './Result/Result';
import Answer from './Answer/Answer';

import "./Results.css";

export default function Results(props) {

  const infoStyle = {
    margin: '1em'
  }

  let results = props.documents.map((result, index) => {
    return <Result 
        key={index} 
        document={result.document}
        highlights={result.highlights}
      />;
  });

  let beginDocNumber = Math.min(props.skip + 1, props.count);
  let endDocNumber = Math.min(props.skip + props.top, props.count);

//console.log(props.documents);
  var answer;
  if(props.answer.answer.answer && beginDocNumber === 1 && props.answer.answer.answer !== "No good match found in KB.") {
    answer = <Answer data={props.answer}></Answer>;
  } else {
    answer = null;
  }

  return (
    <div>
      <p style={infoStyle}>Showing {beginDocNumber}-{endDocNumber} of {props.count.toLocaleString()} results</p>
      <div>
        {answer}
      </div>
      <div>
        {results}
      </div>
    </div>
  );
};
