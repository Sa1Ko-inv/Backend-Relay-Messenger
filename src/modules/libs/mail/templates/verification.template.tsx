import * as React from 'react'
import { Html } from '@react-email/html';
import { Body, Head, Tailwind, Preview, Section, Link, Text, Heading } from 'react-email';

interface VerificationTemplateProps {
   domain: string
   token: string
}

export function VerificationTemplate({domain, token}: VerificationTemplateProps) {
   const verificationLink = `${domain}/accounts/verify?token=${token}`

   return (
      <Html>
         <Head />
         <Preview>Верификация аккаунта</Preview>
         <Tailwind>
            <Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
               <Section className='text-center mb-8'>
                  <Heading className='text-3xl text-black font-bold'>
                     Подтверждение вашей почты
                  </Heading>
                  <Text className='text-base text-black'>
                     Спасибо за регистрацию в мессенджере Relay! Чтобы подтвердить свой адрес электронной почты, пожалуйста, перейдите по следующей ссылке:
                  </Text>

                  <Link href={verificationLink} className='inline-flex justify-center items-center rounded-full text-sm font-medium text-white bg-[#18B9AE] px-5 py-2'>
                     Подтвердить почту
                  </Link>
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
