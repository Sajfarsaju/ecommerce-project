const multer = require('multer');
const path = require('path');


function createMulter (){
    const storage = multer.diskStorage({
        destination:(req,file,cb)=>{
          cb(null,path.join(__dirname,'../public/productImages'));
        },
        filename:(req,file,cb)=> {
          const name = Date.now()+'-'+file.originalname;
          cb(null,name);
        }
      });

let upload = multer ({storage:storage})
return upload;
    }


module.exports = {
    createMulter
}