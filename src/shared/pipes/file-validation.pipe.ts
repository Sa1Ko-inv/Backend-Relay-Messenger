import {
   type ArgumentMetadata,
   BadRequestException,
   Injectable,
   type PipeTransform,
} from '@nestjs/common';
import { type FileUpload } from 'graphql-upload/processRequest.mjs';
import { ReadStream } from 'node:fs';

import { validateFileFormat, validateFileSize } from '@/src/shared/utils/file.util';

@Injectable()
export class FileValidationPipe implements PipeTransform {
   public async transform(
      value: Promise<FileUpload> | undefined | null,
      metadata: ArgumentMetadata
   ) {
      if (!value) {
         return value;
      }

      const file = await value;

      if (!file || !file.filename) {
         return null;
      }

      const { filename, createReadStream } = file;

      const fileStream = createReadStream() as ReadStream;

      const allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

      const isFileFormatValid = validateFileFormat(filename, allowedFormats);

      if (!isFileFormatValid) {
         throw new BadRequestException('Не поддерживаемый формат файла');
      }

      const isFileSizeValid = await validateFileSize(fileStream, 10 * 1024 * 1024);

      if (!isFileSizeValid) {
         throw new BadRequestException('Размер файла превышает 10МБ');
      }

      return file;
   }
}
