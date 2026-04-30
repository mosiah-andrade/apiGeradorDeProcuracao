import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);
export const sendWelcomeEmail = async (email: string, fullName: string) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 0; text-align: center; background-color: #ffffff;">
              <h1 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">
                Asa<span style="color: #2563eb;">web</span>
              </h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 20px; font-weight: 700;">
                Bem-vindo ao time, ${fullName}!
              </h2>
              <p style="margin: 0 0 32px 0; color: #64748b; font-size: 16px; line-height: 24px;">
                Sua conta na Asaweb foi criada com sucesso. Agora você tem acesso à plataforma completa para gerenciar suas propostas de energia solar.
              </p>
              
              <a href="https://app.asaweb.tech" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2);">
                Acessar meu Dashboard
              </a>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 30px; background-color: #f1f5f9; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                &copy; ${new Date().getFullYear()} Asaweb Tech. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const response = await resend.emails.send({
      from: 'Asaweb <noreply@asaweb.tech>',
      to: email,
      subject: '✨ Bem-vindo ao Asaweb!',
      html: htmlContent,
    });

    if (response.error) {
      console.error("Erro no Resend:", response.error);
    } else {
      console.log("E-mail enviado com estilo! ID:", response.data?.id);
    }
  } catch (error) {
    console.error("Erro crítico:", error);
  }
};

