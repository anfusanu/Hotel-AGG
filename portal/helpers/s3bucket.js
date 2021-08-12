var aws = require("aws-sdk");
var multer = require("multer");
var multerS3 = require("multer-s3");
const BUCKET_NAME = "hotel-agg"


var s3 = new aws.S3({
  accessKeyId: "AKIA3USYU6TKMYHMRPND",
  secretAccessKey: "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",
  region: "ap-south-1",
  Bucket: BUCKET_NAME
});


var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      let fileType = file.mimetype.split("/")[1]
      cb(null, `${req.session.admin.userId}${Date.now()}.${fileType}`);
    },
  }),
});

exports.imageUpload = (req, res, next) => {
  const uploadS3 = upload.array("photos", 10);
  uploadS3(req, res, async (err) => {
    if (err) console.log('This is an error you have encountered'+err);
    next();
  });
};


exports.imageDelete = (fileName)=>{
  const params = {
    Bucket: BUCKET_NAME,       
    Key: fileName         
  }
    return new Promise((resolve, reject) => {
        s3.createBucket({
            Bucket: BUCKET_NAME
        }, function () {
            s3.deleteObject(params, function (err, data) {
                if (err) reject(err)
                else resolve(true)
            });
        });
    });
};

