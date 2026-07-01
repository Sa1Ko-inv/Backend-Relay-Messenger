import * as React from 'react';
import { Html } from '@react-email/html';
import { Body, Head, Heading, Link, Preview, Section, Tailwind, Text } from 'react-email';

export interface AccountDeletionTemplateProps {
   domain: string
}

export function AccountDeletionTemplate({ domain } : AccountDeletionTemplateProps) {

   const registerLink = `${domain}/account/create`

   return (
      <Html>
         <Head />
         <Preview>Аккаунт удален</Preview>
         <Tailwind>
            <Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
               <Section className='text-center'>
                  <Heading className='text-3xl text-black font-bold'>
                     Ваш аккаунт был полностью удален
                  </Heading>
                  <Text className='text-base text-black mt-2'>
                     Ваш аккаунты был полностью стерт из базы данных Relay Messenger. Все ваши данные и информация были удалены безвозвратно.
                  </Text>
               </Section>

               <Section className='text-center text-black bg-white rounded-lg shadow-md p-6 mb-4'>
                  <Text>
                     Вы больше не будете получать уведомления в Telegram и на электронную почту
                  </Text>
                  <Text>
                     Если вы захотите вернуться в наш мессенджер, вы можете зарегистрироваться по следующей ссылке:
                  </Text>
                  <Link href={registerLink} className='inline-flex justify-center items-center rounded-md mt-2 text-sm font-medium text-white bg-[#18B9AE] px-5 py-2'>
                     Зарегистрироваться в Relay
                  </Link>.
               </Section>

               <Section className='text-center text-black'>
                  <Text className='text-base text-black mt-2'>
                     Спасибо, что были с нами! Мы надеемся, что вы вернетесь в будущем и снова присоединитесь к нашему сообществу.
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
