import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: 'minio',
      port: 9000,
      useSSL: false,
      accessKey: 'minio',
      secretKey: 'minio123',
    });
    this.bucketName = 'images';
  }

  async createBucketIfNotExists() {
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(this.bucketName);
    }
  }

  async uploadFile(folder: string, file: Express.Multer.File) {
    const fileName = `${folder}/${file.originalname}`;

    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
    );

    return fileName;
  }

  async uploadLocalFile(
    minioFolderPath: string,
    localFileName: string,
    localFilePath: string,
  ) {
    const fileContent = fs.readFileSync(localFilePath);
    const minioFilePath = `${minioFolderPath}/${localFileName}`;

    await this.minioClient.putObject(
      this.bucketName,
      minioFilePath,
      fileContent,
    );

    return minioFilePath;
  }

  async uploadLocalFolder(minioFolderPath: string, localFolderPath: string) {
    await fs.readdir(localFolderPath, async (err, files) => {
      if (files) {
        for (const file of files) {
          await this.uploadLocalFile(
            minioFolderPath,
            file,
            `${localFolderPath}/${file}`,
          );
        }
      }
    });
  }

  async getFileUrl(fileName: string) {
    return await this.minioClient.presignedUrl(
      'GET',
      this.bucketName,
      fileName,
    );
  }

  async deleteFile(fileName: string) {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }
}
