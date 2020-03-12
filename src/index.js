import express from 'express';
const app = express();
import bodyParser from 'body-parser';
import fs from 'fs';
import environment from '../environment';
import cors from 'cors';
import path from 'path';
import chalks from 'chalk';
import Encryption from '../Encryption';
import randomstring from "randomstring";

import multiparty from 'connect-multiparty';
var multipartyMiddleware = multiparty();
var AWS = require('aws-sdk');

var bucketName = "";
var AWS_ACCESS_KEY = '';
var AWS_SECRET_KEY = '';

AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY
});

AWS.config.region = 'us-west-2';


// getting application environment
const env = process.env.NODE_ENV;
// console.log('env :', env);
// return false
// getting application config based on environment
const envConfig = environment[env];

// console.log('envConfig :', envConfig);
// return false
// setting port value
const PORT = envConfig.port || 3000;


app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));

app.use(express.static(path.join(__dirname, '/public')));
app.use(cors());

app.listen(PORT, () => {
    console.log("server listen on port:-", PORT)
});


app.post('/upload', multipartyMiddleware, function (req, res) {
    var s3 = new AWS.S3();
    var file = req.files.file;
    // console.log('file :', file);
    // return
    var buffer = fs.readFileSync(file.path);

    var startTime = new Date();

    var partLength = Math.ceil(buffer.length / 3);
    // console.log('partLength :', partLength);
    // return false
    var promises = [];
    var i = 1;
    var exe = file.originalFilename.split('.');
    var name = path.basename(file.originalFilename, "." + exe[exe.length - 1]);
    file.originalFilename = name + "-" + Date.now();
    // console.log('file.originalFilename :', file.originalFilename);

    console.log(chalks.redBright('Please wait your file is uploading in process -: ------'));

    for (var start = 0; start < buffer.length; start += partLength, i++) {
        var end = Math.min(start + partLength, buffer.length);
        // console.log('end :', end);
        // return false
        var partParams = {
            fieldName: file.fieldName,
            originalFilename: file.originalFilename + "_" + i + "." + exe[exe.length - 1],
            buffer: buffer.slice(start, end),
            type: file.type,
            headers: file.headers,
            Key: file.name
        };
        // uploadPart(partParams);
        promises.push(uploadLoadToS3(partParams));
    }

    Promise.all(promises).then(function (data) {
        // console.log('data :', data);
        // console.log('data :', data.Location);
        // return
        // var locationUrl = [];
        // for (const iterator of data) {
        //     var uploadingTime = (new Date() - startTime) / 1000;
        //     locationUrl.push(iterator.Location);
        // }

        // console.log('locationUrl :', locationUrl);
        // return

        var uploadingTime = (new Date() - startTime) / 1000;
        console.log(chalks.greenBright('Completed upload in', uploadingTime, 'seconds'));
        res.send(data);

    }).catch(function (err) {
        res.send(err);
    })

    function uploadLoadToS3(ObjFile) {

        var params = {
            Bucket: bucketName,
            Key: ObjFile.originalFilename,
            Body: ObjFile.buffer,
        }
        return s3.upload(params).promise();
    }



    // function uploadPart(partParams) {
    //     const params = {
    //         Bucket: bucketName,
    //         Key: partParams.originalFilename,
    //         Body: partParams.buffer,
    //     };

    //     console.log('params :', params);
    //     // return
    //     s3.upload(params, function (s3Err, data) {

    //         return new Promise((resolve, reject) => {
    //             if (s3Err) {
    //                 // return
    //                 reject("s3Err -:", s3Err);
    //             }

    //             var uploadingTime = (new Date() - startTime) / 1000;
    //             console.log('Completed upload in', uploadingTime, 'seconds');

    //             console.log(chalks.blue(`File uploaded successfully at -:  ${data.Location}`));
    //             resolve(data.Location);
    //         });
    //     });
    // }
})



app.post('/download', multipartyMiddleware, function (req, res) {

    console.log(chalks.yellowBright("Now u are the inter in download functionality -: ------"));
    // return false

    // var s3 = new AWS.S3();

    var s3 = new AWS.S3()

    // console.log("jai ho");
    // return
    exports.handler = async function (event) {
        console.log("jai hoooooooo");
        return
        var jjjj = s3.listBuckets().promise();
        console.log('jjjj :', jjjj);

        // return s3.listBuckets().promise()
    }

    // return false

    var filenames = []

    var cnt = 0;

    filenames.forEach(function (filename) {

        var req = s3.getObject({
            Bucket: bucketName,
            Key: filename
        })

        console.log('req :', req);
        // return false
        // console.log('filenames.length :', filenames.length);
        // return false
        req.on('send', function (resp) {
            resp.request.httpRequest.stream.on('close', function () {
                throw new Error("Connection closed");
            });
        });

        var writeStream = fs.createWriteStream(path.basename(filename));
        // console.log('writeStream :', writeStream);
        // return false
        // req.createReadStream().pipe(writeStream);
        // console.log('object :', req.createReadStream().pipe(writeStream));
        // return false
        writeStream.on('close', function () {
            cnt++;
            if (cnt == filenames.length) {
                var sizeFromS3 = filenames.map(function (x) {
                    return fs.statSync(path.basename(x)).size;
                });
                assert.deepEqual(sizeFromS3, [276338, 276985, 276954, 277194, 34016, 32861, 32157, 32039]);
            }
        });

    });

})



app.post('/imageUploadInEncription', multipartyMiddleware, function (req, res) {
    // var s3 = new AWS.S3();
    var fileDetail = req.files.file;
    console.log('fileDetail :', fileDetail);
    // return
    var buffer = fs.readFileSync(fileDetail.path);
    var pw = randomstring.generate(25);

    // var startTime = new Date();

    return new Promise(async (resolve, reject) => {
        try {
            console.log('pw -------------::::::::::', pw);
            var file = await Encryption.encryptstream(new Buffer(buffer, "base64"), pw);
            // console.log('file :', file);
            // return false
            const exe = fileDetail.originalFilename.split('.');

            const name = path.basename(fileDetail.originalFilename, "." + exe[exe.length - 1]);
            console.log("name -: ", name);

            fileDetail.originalFilename = Date.now() + '-' + name + '.' + exe[exe.length - 1];

            const param = {
                fileName: file,
                originalname: fileDetail.originalFilename
            }

            await s3uploadFile(param).then(async fileName => {
                console.log("File uploaded with name " + fileName);
                var response = {
                    hash: file,
                    fileName: fileName
                }
                resolve(response);
            }).catch(err => {
                console.log("err", err)
                throw err;
            })
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
})


function s3uploadFile(params) {
    return new Promise((resolve, reject) => {
        try {
            var s3 = new AWS.S3();
            var filedetails = {
                // ACL: 'public-read',
                Bucket: bucketName,
                Body: params.fileName,
                Key: params.originalname
            };
            console.log(filedetails);
            s3.upload(filedetails, (error, res) => {

                if (error) {
                    console.log("s3 upload error", error);
                    reject(error);
                    return false;
                }

                console.log(res);
                console.log(`Successfully uploaded '${params.originalname}'!`);
                resolve(params.originalname);
            });
        } catch (err) {
            reject(err);
        }
    });

}

app.post('/decryptedThenDownload', multipartyMiddleware, async function (req, res) {

    var currentdate = new Date();
    var completeFullDateTime = "Last seen: " + currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + " || " +
        currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();

    // console.log('completeFullDateTime :', completeFullDateTime);
    // return false

    console.log(chalks.yellowBright("Now u are the inter in download functionality -: ------"));
    // return false
    // var file = await downloadFile((path.basename(attachment.url)));
    var file = await downloadFile();
    // console.log('file ------:', file);
    // return false
    var pw = 'xPwUrbyEjgEQM8VfXBn5AwxMI';
    var content = await Encryption.decryptstream(file, pw);
    console.log('content :', content);

    const param = {
        fileName: content,
        originalname: 'hire-nodejs-developers.png'
    }
    let fileName = await s3uploadFiletemp(param).catch(err => {
        console.log("err", err)
        throw err;
    })
    console.log("fileName", fileName);



})








function downloadFile() {
    return new Promise((resolve, reject) => {
        try {

            var s3 = new AWS.S3();

            const params = {
                Bucket: bucketName,
                Key: '1582784563384-hire-nodejs-developers.png'
            };
            console.log(params);
            s3.getObject(params, async (err, data) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }

                console.log("file Data Got", data.Body);
                // return false
                resolve(data.Body);
            });
        } catch (err) {
            reject(err);
        }
    });
};


function s3uploadFiletemp(params) {
    return new Promise((resolve, reject) => {
        try {

            var s3 = new AWS.S3();

            var filedetails = {
                // ACL: 'public-read',
                Bucket: 'chunkdemotemp',
                Body: params.fileName,
                Key: params.originalname
            };
            console.log(filedetails);
            s3.upload(filedetails, (error, res) => {

                if (error) {
                    console.log("s3 upload error", error);
                    reject(error);
                    return false;
                }

                console.log(res);
                console.log(`Successfully uploaded '${params.originalname}'!`);
                resolve(res.Location);
            });
        } catch (err) {
            reject(err);
        }
    });

}


module.exports = app;