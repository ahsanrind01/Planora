import multer from 'multer';
import path from 'path'

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'uploads/')
    },

    filename: (req,file,cb)=>{
        cb(null,`${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
    }
})

const filerFiles =(file,cb)=>{
    const fileTypes = /jpg|jpeg|png/;
    const extention= fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mime=fileTypes.test(file.mimetype);

    if(extention && mime ){
        return cb(null,true)
    }else{
        cb(new Error('images only!!!'))
    }
}

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 ,
    },
    fileFilter: (req,file,cb)=>{
        filerFiles(file,cb)
    }
})

export default upload;