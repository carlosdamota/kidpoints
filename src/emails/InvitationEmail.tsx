import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface InvitationEmailProps {
  childName: string;
  inviterName: string;
  appUrl: string;
}

export const InvitationEmail = ({
  childName = "Einar",
  inviterName = "Papá",
  appUrl = "https://misiones-familia.app",
}: InvitationEmailProps) => {
  const previewText = `¡Únete a la aventura de ${childName}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#00ffff",
                dark: "#0a0a0a",
              },
            },
          },
        }}
      >
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[32px]">
              <div className="w-12 h-12 bg-brand rounded-full mx-auto flex items-center justify-center mb-4">
                <span className="text-2xl">🚀</span>
              </div>
            </Section>
            <Heading className="text-black text-[24px] font-black text-center p-0 my-[30px] mx-0">
              ¡Hola!
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>{inviterName}</strong> te ha invitado a unirte a la aventura de <strong>{childName}</strong> en nuestra aplicación de misiones familiares.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Desde aquí podrás ver sus progresos, validar sus misiones y celebrar sus logros en tiempo real.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Link
                className="bg-brand rounded-xl text-black text-[12px] font-black no-underline text-center px-5 py-3"
                href={appUrl}
              >
                ENTRAR A LA APP
              </Link>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Esta es una invitación privada para tu entorno familiar. ¡Nos vemos dentro!
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default InvitationEmail;
