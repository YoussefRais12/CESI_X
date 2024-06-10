const express = require("express");
const nodemailer = require("nodemailer");
const user = require("../models/user");
const router = express.Router();
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail(to, subject, text) {
  const mail = {
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
  };

  try {
    let message = await transporter.sendMail(mail);
    console.log("Email envoyé:" + message.response);
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de message; veuillez rééssayer: ",
      error
    );
  }
}

router.post("/login", async (req, res) => {
  // authMiddleware
  const user = req.user;
  await sendEmail(
    user.email,
    "Connexion réussie",
    "Vous vous êtes connecté avec succès."
  );
  res.json({ message: "Email de connexion envoyé" });
});

router.post("/order", async (req, res) => {
  const user = req.user;
  await sendEmail(
    user.email,
    "Commande confirmée",
    "Votre commande a été confirmée."
  );
  res.json({ message: "Email de confirmation de commande envoyé" });
});

router.post("/notify", async (req, res) => {
  const user = req.user;
  setTimeout(async () => {
    await sendEmail(
      user.email,
      "Commande en cours",
      "Vous y êtes presque!! Veuillez terminer votre achat"
    );
  }, 300000);
  res.json({ message: "Notification de commande en cours programmée" });
});

router.post("/sendEmails", authMiddleware, async (req, res) => {
  const subject = req.body.subject;
  const message = req.body.message;

  try {
    const users = await User.find({});
    for (const user of users) {
      await sendEmail(user.email, subject, message);
    }
    res.json({ message: "E-mails envoyés avec succès!" });
  } catch (error) {
    console.error("Erreur lors de l'envoi des e-mails:", error);
    res.status(500).json({ error: "Erreur lors de l'envoi des e-mails." });
  }
});

module.exports = router;
