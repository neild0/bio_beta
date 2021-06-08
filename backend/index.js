const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer');
const upload = multer({dest: './uploads/'});

// const db = require('./db/master-index')
// const masterRouter = require('./routes/master-router')

const app = express()
const apiPort = process.env.PORT || 3333;

// app.use(bodyParser());  // to use bodyParser (for text/number data transfer between clientg and server)
// app.use(express.json());
// app.use(express.urlencoded({extended: false}));

function multerGenerator(type,loc) {
    let storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, loc))
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname.match(/\..*$/)[0])
        }
    });
    if (type == 'image') {
        let multi_upload = multer({
            storage,
            limits: {fileSize: 1 * 1024 * 1024}, // 1MB
            fileFilter: (req, file, cb) => {
                if (file.mimetype == "image") {
                    cb(null, true);
                } else {
                    cb(null, false);
                    const err = new Error('Only .png, .jpg and .jpeg format allowed!')
                    err.name = 'ExtensionError'
                    return cb(err);
                }
            },
        }).array('uploadedImages', 2)
    }

    return multi_upload
}



// db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.post('/api/image_upload', (req, res) => {
    let upload_func = multerGenerator('image','./images')
    upload_func(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            res.status(500).send({ error: { message: `Multer uploading error: ${err.message}` } }).end();
            return;
        } else if (err) {
            // An unknown error occurred when uploading.
            if (err.name == 'ExtensionError') {
                res.status(413).send({ error: { message: err.message } }).end();
            } else {
                res.status(500).send({ error: { message: `unknown uploading error: ${err.message}` } }).end();
            }
            return;
        }

        // Everything went fine.
        // show file `req.files`
        // show body `req.body`
        res.status(200).end('Your files uploaded.');
    })
});

// app.use('/api', masterRouter)

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))