export default async function handler(req, res) {
    if (req.method === "POST") {
      const subscription = req.body;
  
      // Aquí deberías guardar la suscripción en tu backend
      // Ahora mismo vamos a imprimirla
      console.log("✅ Nueva suscripción:", JSON.stringify(subscription));
  
      res.status(201).json({ message: "Suscripción guardada." });
    } else {
      res.status(405).end(); // Método no permitido
    }
  }
  