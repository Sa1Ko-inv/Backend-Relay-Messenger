import { ReadStream } from 'node:fs';

export function validateFileFormat(filename: string, allowedFileFormats: string[]) {
   const fileParts = filename.split('.');

   const extension = fileParts[fileParts.length - 1];

   return allowedFileFormats.includes(extension);
}

export async function validateFileSize(fileStream: ReadStream, allowedFileSizeInBites: number) {
   return new Promise((resolve, reject) => {
      let fileSizeInBites = 0;

      fileStream
         .on('data', (data: Buffer) => {
            fileSizeInBites = data.byteLength;
         })
         .on('end', () => {
            resolve(fileSizeInBites <= allowedFileSizeInBites);
         })
         .on('error', err => {
            reject(err);
         });
   });
}
