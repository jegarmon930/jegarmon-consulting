// pages/api/lead.js
// Handles: Airtable storage + Email + SMS notifications on new lead

import nodemailer from "nodemailer";
import twilio from "twilio";

// ── AIRTABLE ──────────────────────────────────────────────────────────────────
async function saveToAirtable(lead) {
  const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(
    process.env.AIRTABLE_TABLE_NAME || "Leads"
  )}`;

  const fields = {
    "Name": lead.name,
    "Company": lead.company || "",
    "Email": lead.email,
    "Phone": lead.phone || "",
    "Project Type": lead.projectType || "",
    "Installation / Location": lead.installation || "",
    "Status": "New Lead",
    "Source": "Website AI Intake",
    "Submitted At": new Date().toISOString(),
    "Notes": lead.notes || "",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Airtable error: ${JSON.stringify(err)}`);
  }

  return await response.json();
}

// ── EMAIL NOTIFICATION ────────────────────────────────────────────────────────
async function sendEmailNotification(lead) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0d0d0a; color: #c8c8b8; padding: 32px; border-radius: 10px;">
      <div style="border-bottom: 2px solid #b4945a; padding-bottom: 16px; margin-bottom: 24px;">
        <h2 style="color: #d4b06a; margin: 0; font-size: 22px;">🏗️ New Consulting Inquiry</h2>
        <p style="color: #5a5a4a; margin: 4px 0 0; font-size: 13px;">JE Garmon CM Consulting — AI Intake Platform</p>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        ${[
          ["Name", lead.name],
          ["Company", lead.company || "—"],
          ["Email", `<a href="mailto:${lead.email}" style="color: #d4b06a;">${lead.email}</a>`],
          ["Phone", lead.phone || "—"],
          ["Project Type", lead.projectType || "Not yet provided"],
          ["Installation", lead.installation || "Not yet provided"],
        ].map(([label, value]) => `
          <tr>
            <td style="padding: 10px 0; color: #5a5a4a; font-size: 12px; width: 140px; vertical-align: top;">${label}</td>
            <td style="padding: 10px 0; color: #c8c8b8; font-size: 13px;">${value}</td>
          </tr>
        `).join("")}
      </table>

      ${lead.notes ? `
        <div style="margin-top: 20px; background: rgba(180,148,90,0.06); border: 1px solid rgba(180,148,90,0.2); border-radius: 6px; padding: 14px;">
          <p style="color: #5a5a4a; font-size: 11px; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 1px;">Initial Notes</p>
          <p style="color: #c8c8b8; font-size: 13px; margin: 0; line-height: 1.6;">${lead.notes}</p>
        </div>
      ` : ""}

      <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid rgba(180,148,90,0.15);">
        <p style="color: #4a4a3a; font-size: 11px; margin: 0;">
          Submitted via AI Intake Platform · ${new Date().toLocaleString("en-US", { timeZone: "America/Denver" })} MT
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"JE Garmon Consulting" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFY_EMAIL,
    subject: `🏗️ New Lead: ${lead.name}${lead.company ? ` — ${lead.company}` : ""}`,
    html,
  });
}

// ── SMS NOTIFICATION ──────────────────────────────────────────────────────────
async function sendSmsNotification(lead) {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  const body = [
    `🏗️ NEW LEAD — JE Garmon Consulting`,
    `Name: ${lead.name}`,
    `Company: ${lead.company || "—"}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone || "—"}`,
    lead.projectType ? `Project: ${lead.projectType}` : null,
    `\nCheck Airtable for full details.`,
  ].filter(Boolean).join("\n");

  await client.messages.create({
    body,
    from: process.env.TWILIO_FROM_NUMBER,
    to: process.env.NOTIFY_PHONE,
  });
}

// ── HANDLER ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const lead = req.body;
  if (!lead?.name || !lead?.email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const results = { airtable: false, email: false, sms: false, errors: [] };

  // Run all three in parallel
  await Promise.allSettled([
    saveToAirtable(lead).then(() => { results.airtable = true; }).catch(e => results.errors.push(`Airtable: ${e.message}`)),
    sendEmailNotification(lead).then(() => { results.email = true; }).catch(e => results.errors.push(`Email: ${e.message}`)),
    sendSmsNotification(lead).then(() => { results.sms = true; }).catch(e => results.errors.push(`SMS: ${e.message}`)),
  ]);

  // Always return 200 — don't block the user flow if a notification fails
  return res.status(200).json({ success: true, results });
}
