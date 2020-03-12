module.exports = {
    development: {
        port: 6161, // assign your own port no
        mongoUrl: 'mongodb://192.168.1.204:27017/s3upload-In-multipart',
        logs: 'dev',

    },
    production: {
        port: 6161, // assign your own port no
        mongoUrl: 'mongodb://13.234.75.187:27017/s3upload-In-multipart',
        logs: 'combined',

    },
    test: {
        port: 6161,
        mongoUrl: 'mongodb://localhost:27017/s3upload-In-multipart',
        logs: 'dev',
    }
};