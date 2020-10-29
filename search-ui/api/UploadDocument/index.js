const storageAccountName = process.env["StorageAccountName"];

module.exports = async function (context, req) {
    
    //todo: add upload logic

    context.res = {
        // status: 200, /* Defaults to 200 */
        headers: {
            "Content-type": "application/json"
        },
        body: { StorageAccountName: storageAccountName}
    };
    
};
