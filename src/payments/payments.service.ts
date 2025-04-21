import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {

  private readonly stripe = new Stripe(envs.stripeSecretKey);

  async createPaymentSession(paymentSessionDto: PaymentSessionDto){

    const { currency, items, orderId } = paymentSessionDto;
    const line_items = items.map(item => ({
      price_data: {
        currency,
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Convertir a centavos
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      // Colocar aqui el ID de la orden
      payment_intent_data: {
        metadata: {
          orderId: orderId,
        }
      },
      line_items,
      mode: 'payment',
      success_url:envs.stripeSuccessUrl,
      cancel_url: envs.stripeCancelUrl,
    });
    return session;
  } 

  async stripeWebhook(req: Request, res: Response){
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(req['rawBody'], sig, envs.stripeEndpointSecretKey);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    
    switch(event.type){
      case 'charge.succeeded':
        console.log('Payment succeeded', event.data.object.metadata);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
        break;
    }

    return res.status(200).json({ sig });
  }

}
