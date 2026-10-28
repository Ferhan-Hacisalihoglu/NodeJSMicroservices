import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from 'node:crypto';



export function getS3Client(): S3Client {
    const endpoint = process.env.MINIO_URL;
    const accessKey = process.env.MINIO_ROOT_USER;
    const secretKey = process.env.MINIO_ROOT_PASSWORD;
    const region = process.env.MINIO_REGION;

    if (!endpoint || !accessKey || !secretKey) {
        throw new Error(
            "Storage envs are missing: MINIO_URL, MINIO_ROOT_USER and MINIO_ROOT_PASSWORD are required",
        );
    }

    return new S3Client({
        endpoint,
        region: region,
        credentials: {
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
        },
        forcePathStyle: true,
    });
}

export async function uploadBuffer(buffer: Buffer, contentType: string): Promise<{imageUrl: string; publicId: string}> {
    const bucket = process.env.MINIO_BUCKET;
    const endPoint = process.env.MINIO_URL;

    if (!bucket || !endPoint) {
        throw new Error("Endpoint and bucket are not present");
    }

    const Key = `support-tasks/${randomUUID()}`

    await getS3Client().send(
        new PutObjectCommand({
            Bucket: bucket, 
            Key,
            Body: buffer,
            ContentType: contentType
        })
    )

    const baseUrl = endPoint.endsWith("/") ? endPoint.slice(0, -1) : endPoint;

    return {
        publicId: Key,
        imageUrl: `${baseUrl}/${bucket}/${Key}`
    }

}
