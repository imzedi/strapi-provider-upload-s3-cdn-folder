"use strict";

const AWS = require("aws-sdk");

module.exports = {
  init(config) {
    const S3 = new AWS.S3({
      apiVersion: "2006-03-01",
      ...config,
    });
    const prefix = config.prefix ? `${config.prefix}/` : ""; // Custom

    return {
      upload(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          const path = file.path ? `${file.path}/` : ""; // Coming from file obj from admin client

          let params = {
            Key: `${prefix}${path}${file.hash}${file.ext}`,
            Body: Buffer.from(file.buffer, "binary"),
            ContentType: file.mime,
            ACL: "public-read",
            ...customParams,
          };

          S3.upload(params, (err, data) => {
            if (err) {
              return reject(err);
            }

            file.url = config.cdnUrl
              ? `${config.cdnUrl}/${data.Key.replace(prefix, "")}`
              : data.Location;

            resolve();
          });
        });
      },
      delete(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // delete file on S3 bucket
          const path = file.path ? `${file.path}/` : "";
          S3.deleteObject(
            {
              Key: `${prefix}${path}${file.hash}${file.ext}`,
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              resolve();
            }
          );
        });
      },
    };
  },
};
