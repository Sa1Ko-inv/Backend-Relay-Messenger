import * as React from 'react';
import { SessionMetadata } from '@/src/shared/types/session-metadata.types';
import { Html } from '@react-email/html';
import { Body, Head, Heading, Link, Preview, Section, Tailwind, Text } from 'react-email';

interface ChangeEmailTemplateProps {
   domain: string
   token: string
   metadata: SessionMetadata
}

export function ChangeEmailTemplate({domain, token, metadata}: ChangeEmailTemplateProps) {
   const changeLink = `${domain}/account/change/email/${token}`

   return (
      <Html>
         <Head />
         <Preview>Изменение почты</Preview>
         <Tailwind>
            <Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
               <Section className='text-center mb-8'>
                  <Heading className='text-3xl text-black font-bold'>
                     Смена почты
                  </Heading>
                  <Text className='text-base text-black'>
                     Вы запросили смену почты для вашей учетной записи.
                  </Text>
                  <Text className='text-base text-black'>
                     Чтобы активировать новую почту, нажмите на ссылку ниже
                  </Text>

                  <Link href={changeLink} className='inline-flex justify-center items-center rounded-full text-sm font-medium text-white bg-[#18B9AE] px-5 py-2'>
                     Смена почты
                  </Link>
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
   )
}
