export const sendContactMessage = (req, res) => {
  const { name, email, subject, category, message } = req.body;

  // In a real application, you would save this to a database,
  // send an email, or integrate with a CRM.
  console.log('Received contact message:', { name, email, subject, category, message });

  res.status(200).json({ message: 'Message sent successfully!' });
};
