import { prisma } from '@/lib/prisma';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextRequest, NextResponse } from 'next/server';

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || ''
});

export async function POST(request: NextRequest) {
    try {
        const { albumId, customerData, selectedImageIds } = await request.json();

        const album = await prisma.album.findUnique({
            where: { id: albumId },
        });

        if (!album) {
            return NextResponse.json({ error: 'Álbum não encontrado' }, { status: 404 });
        }

        // Calcular preço
        const photoCount = selectedImageIds.length;
        let totalPrice = album.basePrice;

        if (photoCount > album.basePhotoLimit) {
            totalPrice += (photoCount - album.basePhotoLimit) * album.extraPhotoPrice;
        }

        // Criar pedido no banco de dados
        const order = await prisma.order.create({
            data: {
                customerName: customerData.name,
                customerEmail: customerData.email,
                customerPhone: customerData.phone,
                albumId: album.id,
                totalPhotos: photoCount,
                totalPrice: totalPrice,
                status: 'pending',
                items: {
                    create: selectedImageIds.map((id: string) => ({
                        imageId: id,
                    })),
                },
            },
        });

        // Criar preferência no Mercado Pago
        const preference = new Preference(client);
        const response = await preference.create({
            body: {
                items: [
                    {
                        id: order.id,
                        title: `Seleção de fotos - Álbum: ${album.titulo}`,
                        quantity: 1,
                        unit_price: totalPrice,
                        currency_id: 'BRL',
                    }
                ],
                payer: {
                    name: customerData.name,
                    email: customerData.email,
                },
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_APP_URL}/loja/sucesso?orderId=${order.id}`,
                    failure: `${process.env.NEXT_PUBLIC_APP_URL}/loja/falha`,
                    pending: `${process.env.NEXT_PUBLIC_APP_URL}/loja/pendente`,
                },
                auto_return: 'approved',
                notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/loja/webhook`,
                external_reference: order.id,
            }
        });

        // Atualizar pedido com ID da preferência (opcional, mas bom)
        // await prisma.order.update({ where: { id: order.id }, data: { paymentId: response.id } });

        return NextResponse.json({
            id: response.id,
            init_point: response.init_point,
            orderId: order.id
        });

    } catch (error) {
        console.error('Erro no checkout:', error);
        return NextResponse.json({ error: 'Erro ao processar checkout' }, { status: 500 });
    }
}
