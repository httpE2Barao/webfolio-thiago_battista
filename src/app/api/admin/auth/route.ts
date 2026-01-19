import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { password } = await req.json();

        const validPassword = process.env.VALID_PASSWORD || process.env.NEXT_PUBLIC_VALID_PASSWORD;

        if (!validPassword) {
            console.error('ADMIN_AUTH: No valid password configured in environment variables.');
            return NextResponse.json({ success: false, error: 'Configuração do servidor incompleta.' }, { status: 500 });
        }

        if (password === validPassword) {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, error: 'Senha incorreta.' }, { status: 401 });
    } catch (error) {
        console.error('ADMIN_AUTH_ERROR:', error);
        return NextResponse.json({ success: false, error: 'Erro interno no servidor.' }, { status: 500 });
    }
}
