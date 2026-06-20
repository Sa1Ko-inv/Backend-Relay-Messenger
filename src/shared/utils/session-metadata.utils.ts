import type { Request } from 'express';
import { lookup } from 'geoip-lite';
import * as countries from 'i18n-iso-countries';

import type { SessionMetadata } from '@/src/shared/types/session-metadata.types';
import { IS_DEV_ENV } from '@/src/shared/utils/is-dev.util';

import DeviceDetector = require('device-detector-js');

countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

export function getSessionMetadata(req: Request, userAgent: string): SessionMetadata {
   const ip =
      (IS_DEV_ENV
         ? '217.15.135.107' // Просто IP вашинктона
         : Array.isArray(req.headers['cf-connection-ip'])
           ? req.headers['cf-connection-ip'][0]
           : req.headers['cf-connection-ip'] ||
             (typeof req.headers['x-forwarded-for'] === 'string'
                ? req.headers['x-forwarded-for'].split(',')[0]
                : req.ip)) ?? '0.0.0.0';

   const location = lookup(ip);
   const device = new DeviceDetector().parse(userAgent);

   return {
      location: {
         country: countries.getName(location?.country || 'Неизвестно', 'en') || 'Неизвестно',
         city: location?.city || 'Неизвестно',
         latitude: location?.ll[0] || 0,
         longitude: location?.ll[1] || 0,
      },
      deviceInfo: {
         browser: device.client?.name || 'Неизвестно',
         os: device.os?.name || 'Неизвестно',
         type: device.device?.type || 'Неизвестно',
      },
      ip,
   };
}
