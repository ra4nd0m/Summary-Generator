const makeSummary = require("./app");

(async()=>{
    try{
    await makeSummary();
    console.log("Success");
    }catch(err){
        console.error("Error! ",err);
    }finally{
        console.log("Press Ctrl+C to close the app");
        process.stdin.resume();
        process.stdin.on('end', () => {
            process.exit();
        });
    }
})();