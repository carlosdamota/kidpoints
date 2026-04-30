import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // Must be first — Node doesn't auto-load .env files

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 5000;

function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && EMAIL_REGEX.test(email.trim());
}

async function getResendClient() {
  const { Resend } = await import("resend");
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured. Add it to your .env.local file.');
  }
  return new Resend(apiKey);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  app.use(express.json());


  app.post("/api/invite", async (req, res) => {
    const { email, childName, inviterName } = req.body;

    // Validate required fields
    if (!email || !childName) {
      return res.status(400).json({ error: "Faltan datos requeridos: email y childName son obligatorios." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "El email proporcionado no tiene un formato válido." });
    }
    if (typeof childName !== 'string' || childName.trim().length === 0 || childName.length > MAX_NAME_LENGTH) {
      return res.status(400).json({ error: `childName debe tener entre 1 y ${MAX_NAME_LENGTH} caracteres.` });
    }
    if (inviterName !== undefined && (typeof inviterName !== 'string' || inviterName.length > MAX_NAME_LENGTH)) {
      return res.status(400).json({ error: `inviterName debe tener como máximo ${MAX_NAME_LENGTH} caracteres.` });
    }

    try {
      const resend = await getResendClient();
      const { render } = await import("@react-email/components");
      const React = (await import("react")).default;
      const { InvitationEmail } = await import("./src/emails/InvitationEmail.tsx");

      const appUrl = process.env.APP_URL || 'https://ais-dev-w6pvftjnz24rditbzjsy6t-627353199372.europe-west2.run.app';

      const html = await render(
        React.createElement(InvitationEmail, {
          childName: childName.trim(),
          inviterName: (inviterName as string | undefined)?.trim() || 'Alguien',
          appUrl
        })
      );

      const { data, error } = await resend.emails.send({
        from: "Misiones Familia <onboarding@resend.dev>",
        to: [email.trim()],
        subject: `🚀 Invitación para ver las misiones de ${childName.trim()}`,
        html,
      });

      if (error) {
        console.error("Resend API error (invite):", JSON.stringify(error));
        return res.status(400).json({ error: "Error al enviar la invitación", details: error.message });
      }

      res.json({ success: true, data });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Critical error (invite):", message);
      res.status(500).json({ error: "Error interno del servidor", message });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    const { userEmail, type, message, familyId } = req.body;

    // Validate required fields
    if (!type || !['bug', 'suggestion'].includes(type)) {
      return res.status(400).json({ error: "type debe ser 'bug' o 'suggestion'." });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: "message es obligatorio y no puede estar vacío." });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: `El mensaje no puede superar los ${MAX_MESSAGE_LENGTH} caracteres.` });
    }
    if (userEmail !== undefined && userEmail !== null && !isValidEmail(userEmail)) {
      return res.status(400).json({ error: "userEmail no tiene un formato válido." });
    }

    try {
      const resend = await getResendClient();
      const { render } = await import("@react-email/components");
      const React = (await import("react")).default;
      const { FeedbackEmail } = await import("./src/emails/FeedbackEmail.tsx");

      const toEmail = "cdamota.cd@gmail.com";

      const html = await render(
        React.createElement(FeedbackEmail, {
          userEmail: isValidEmail(userEmail) ? userEmail : 'Usuario anónimo',
          type: type as 'bug' | 'suggestion',
          message: message.trim(),
          familyId: (typeof familyId === 'string' && familyId) ? familyId : 'unknown'
        })
      );

      const { data, error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: [toEmail],
        replyTo: isValidEmail(userEmail) ? userEmail : toEmail,
        subject: `${type === 'bug' ? '🐞 BUG' : '💡 SUGERENCIA'} - Misiones Familia`,
        html,
      });

      if (error) {
        console.error("Resend API error (feedback):", JSON.stringify(error));
        return res.status(400).json({ error: "Error de validación en el envío", details: error.message });
      }

      res.json({ success: true, data });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Critical error (feedback):", message);
      res.status(500).json({ error: "Error interno del servidor", message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
