import { prisma } from '@/lib/prisma';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextRequest, NextResponse } from 'next/server';

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || ''
});

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { action, data } = body;

    try {
        if (action === 'payment.created' || action === 'payment.updated') {
            const paymentId = data.id;
            const payment = new Payment(client);
            const paymentData = await payment.get({ id: paymentId });

            if (paymentData.status === 'approved') {
                const orderId = paymentData.external_reference;

                await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'paid',
                        paymentId: paymentId.toString()
                    }
                });

                console.log(`Pedido ${orderId} pago com sucesso!`);
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Erro no webhook do Mercado Pago:', error);
        return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
    }
}
