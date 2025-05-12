import webpush from 'web-push';
import connectToDatabase from '@/lib/mongodb';
import Subscription from '@/models/Subscription';

webpush.setVapidDetails(
  'mailto:admin@arricam.cl',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function POST(req) {
  try {
    await connectToDatabase();
    const { subscription } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return new Response(JSON.stringify({ error: 'Suscripción no válida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Guardar si no existe ya
    const exists = await Subscription.findOne({ endpoint: subscription.endpoint });
    if (!exists) {
      await Subscription.create(subscription);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error al guardar la suscripción' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
