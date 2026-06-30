import * as React from 'react';
import type { SessionMetadata } from '@/src/shared/types/session-metadata.types';
import { Html } from '@react-email/html';
import { Body, Head, Heading, Link, Preview, Section, Tailwind, Text } from 'react-email';

interface DeactivateTemplateProps {
   token: string
   metadata: SessionMetadata
}

export function DeactivateTemplate({token, metadata}: DeactivateTemplateProps) {
    return (
      <Html>
         <Head />
         <Preview>Деактивация аккаунта</Preview>
         <Tailwind>
            <Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
               <Section className='text-center mb-8'>
                  <Heading className='text-3xl text-black font-bold'>
                     Запрос на деактивацию аккаунта
                  </Heading>
                  <Text className='text-base text-black'>
                     Вы инициализировали процесс деактивации вышего аккаунта на платформе <b>Relay Messenger</b>
                  </Text>
               </Section>

               <Section className='bg-gray-100 rounded-lg p-6 text-center mb-6'>
                  <Heading className='text-2xl font-semibold text-black'>Код подтверждение: </Heading>
                  <Heading className='text-3xl font-semibold text-black'>{token}</Heading>
                  <Text className='text-black'>Данный код действует 5 минут</Text>
               </Section>

               <Section className='bg-gray-100 rounded-lg p-6 mb-6'>
                  <Heading className='text-xl font-semibold text-[#18B9AE]'>Информация о запросе</Heading>
                  <ul className='list-disc list-inside mt-2'>
                     <li>Расположение: {metadata.location.country}, {metadata.location.city}</li>
                     <li>Операционная система: {metadata.device.os}</li>
                     <li>Браузер: {metadata.device.browser}</li>
                     <li>Ip: {metadata.ip}</li>
                  </ul>
                  <Text className='text-gray-600 mt-2'>
                     Если вы не инициализировали данный запрос, пожалуйста игнорируйте данный сообщение
                  </Text>
               </Section>

               <Section className='text-center mt-8'>
                  <Text className='text-gray-600'>
                     Если у вас возникли проблемы или вопросы, не стесняйтесь и обращайтесь в нашу тех. поддержку по адресу {' '}
                     <Link href="mailto: relay.team@internet.ru" className='text-[#18b9ae] underline'>
                        relay.team@internet.ru
                     </Link>.
                  </Text>
               </Section>
            </Body>
         </Tailwind>
      </Html>
   );
}