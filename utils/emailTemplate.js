const dotEnv = require("dotenv");
dotEnv.config();

const appLogo = process.env.APP_LOGO;
const emailBg = process.env.EMAIL_BG;
const supportEmail = process.env.APP_EMAIL;

const emailTemplate = ({ heading, message, buttonText, buttonLink, footerNote }) => `
<body style="margin:0; padding:0; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="background-image: url('${emailBg}');
                background-size: cover;
                background-position: center;
                padding: 60px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:500px; margin-bottom:20px;">
          <tr>
            <td align="center">
              <img src="${appLogo}" alt="EventPlace Logo" width="190" />
            </td>
          </tr>
        </table>
        <table width="100%" style="max-width:500px; background:#ffffff; border-radius:10px; padding:35px; box-shadow:0 10px 25px rgba(0,0,0,0.15);">
          <tr>
            <td align="center">
              <h1 style="margin:0; font-size:22px; color:#4B22A6;">
                ${heading}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="color:#4b5563; font-size:15px; line-height:1.6; padding-top:15px;">
              ${message}
            </td>
          </tr>
          ${
            buttonLink
              ? `<tr>
                  <td align="center" style="padding:25px 0;">
                    <a href="${buttonLink}" 
                       style="background:#4B22A7; color:#ffffff; padding:12px 26px; 
                              font-size:15px; font-weight:bold; text-decoration:none; 
                              border-radius:6px; display:inline-block;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="font-size:13px; color:#6b7280; text-align:center;">
                    Or copy and paste:
                    <br><br>
                    <a href="${buttonLink}" style="color:#4B22A7; word-break:break-all;">
                      ${buttonLink}
                    </a>
                  </td>
                </tr>`
              : ""
          }
          <tr>
            <td style="padding-top:25px; text-align:center; font-size:12px; color:#9ca3af;">
              ${footerNote || ""}
              <br><br>
              Need help? 
              <a href="mailto:${supportEmail}" style="color:#4B22A7;">
                Contact Support
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
`;

module.exports = emailTemplate;