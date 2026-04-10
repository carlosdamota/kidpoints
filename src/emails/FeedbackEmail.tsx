import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface FeedbackEmailProps {
  userEmail: string;
  type: "bug" | "suggestion";
  message: string;
  familyId: string;
}

export const FeedbackEmail = ({
  userEmail,
  type,
  message,
  familyId,
}: FeedbackEmailProps) => (
  <Html>
    <Head />
    <Preview>Nuevo {type === "bug" ? "Bug Reportado" : "Sugerencia"} de {userEmail}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🚀 Nuevo Feedback Recibido</Heading>
        <Section style={section}>
          <Text style={label}>Tipo:</Text>
          <Text style={value}>
            {type === "bug" ? "🐞 BUG / ERROR" : "💡 SUGERENCIA"}
          </Text>
          
          <Text style={label}>De:</Text>
          <Text style={value}>{userEmail}</Text>
          
          <Text style={label}>ID Familia:</Text>
          <Text style={value}>{familyId}</Text>
          
          <Hr style={hr} />
          
          <Text style={label}>Mensaje:</Text>
          <Text style={messageBox}>{message}</Text>
        </Section>
        <Text style={footer}>
          Enviado desde el sistema de feedback de Misiones Familia.
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
};

const section = {
  padding: "0 48px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const label = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  marginBottom: "4px",
};

const value = {
  color: "#111827",
  fontSize: "16px",
  marginBottom: "20px",
  fontWeight: "500",
};

const messageBox = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  backgroundColor: "#f9fafb",
  padding: "16px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
};

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "32px",
};
