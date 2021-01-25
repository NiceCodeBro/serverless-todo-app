import * as AWS  from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

const XAWS = AWSXRay.captureAWS(AWS);

export class BucketAccess {
  constructor(
    private s3 = new XAWS.S3({
        signatureVersion: 'v4'
      }),
    private todosImagesBucketName = process.env.TODOS_S3_BUCKET,
    private signedUrlExpireSeconds = process.env.SIGNED_URL_EXPIRATION){
  }

    // Generates an AWS signed URL for uploading objects
    getPutSignedUrl( key: string ) {
        const presignedUrl = this.s3.getSignedUrl('putObject', {
            Bucket: this.todosImagesBucketName,
            Key: key,
            Expires: parseInt(this.signedUrlExpireSeconds),
        });

        return presignedUrl;
    }

  getImageUrl(imageId){
      return `https://${this.todosImagesBucketName}.s3.amazonaws.com/${imageId}`;
  }
}