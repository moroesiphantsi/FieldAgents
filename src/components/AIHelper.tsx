const AIHelper = (lead: any) => {
  const message = `
Hi ${lead.name},

Thank you for your fibre enquiry.

We are pleased to inform you that fibre is available in your area.

Would you like us to proceed with installation booking?

Kind regards,
Fibre Team
  `;

  const sendWhatsApp = () => {
    window.open(
      `https://wa.me/27685932102${lead.contact.replace(/\D/g, "")}?text=${encodeURIComponent(
        message
      )}`,
      "_blank"
    );
  };

  return sendWhatsApp;
};

export default AIHelper;