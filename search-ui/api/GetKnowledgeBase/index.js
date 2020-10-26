const qnAMakerKnowledgeBaseId = process.env["QnAMakerKnowledgeBaseId"];

module.exports = async function (context, req) {
    

    context.res = {
        // status: 200, /* Defaults to 200 */
        headers: {
            "Content-type": "application/json"
        },
        body: { QnAMakerKnowledgeBaseId: qnAMakerKnowledgeBaseId}
    };
    
};
