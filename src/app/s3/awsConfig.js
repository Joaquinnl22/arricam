// src/awsConfig.js
import AWS from 'aws-sdk';

// Configura las credenciales de AWS

const accessKeyId = process.env.accessKeyId;
const secretAccessKey = process.env.secretAccessKey;

AWS.config.update({
  accessKeyId:accessKeyId ,   // Sustituye con tu Access Key ID
  secretAccessKey: secretAccessKey,  // Sustituye con tu Secret Access Key
  region: 'us-east-1',  // O la región que hayas elegido
});


export const uploadToS3 = async (file) => {
    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME, // Nombre del bucket
      Key: `${Date.now()}-${file.name}`, // Nombre único para el archivo
      Body: file,
      ContentType: file.type,
      ACL: "public-read", // Permisos públicos para leer el archivo
    };
  
    try {
      const uploadResult = await s3.upload(params).promise();
      return uploadResult; // Devuelve la URL pública del archivo subido
    } catch (error) {
      console.error("Error al subir a S3:", error);
      throw error;
    }
  };
