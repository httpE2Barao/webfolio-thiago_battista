import staticCategories from '@/config/categories';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("API: Iniciando GET /api/admin/categories");

        // Buscamos todas as categorias. Se 'ordem' der erro, tentamos sem ela.
        let categories: any[] = [];
        try {
            // Cast to 'any' because Prisma internal types might be out of sync with schema
            categories = await (prisma.category as any).findMany({
                orderBy: {
                    ordem: 'asc'
                }
            });
        } catch (e) {
            console.warn("API: Erro ao ordenar por 'ordem', tentando sem ordenação:", e);
            categories = await prisma.category.findMany();
        }

        console.log(`API: ${categories.length} categorias encontradas no banco.`);

        // Se o banco estiver vazio, popula com as categorias do config estático
        if (categories.length === 0) {
            console.log("API: Banco vazio. Iniciando sincronização...");

            // Lida com padrões de exportação CommonJS e ESM
            const config = (staticCategories as any).default || staticCategories;
            const defaultNames = Object.keys(config || {}).filter(k => k !== 'default');

            console.log("API: Chaves detectadas no config:", defaultNames);

            if (defaultNames.length > 0) {
                const syncResults = [];
                for (const [index, name] of defaultNames.entries()) {
                    try {
                        const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
                        const slug = name.toLowerCase();

                        // @ts-ignore - Bypass total de tipos
                        const up = await (prisma.category as any).upsert({
                            where: { slug: slug },
                            update: {
                                name: capitalized,
                                ordem: index
                            },
                            create: {
                                name: capitalized,
                                slug: slug,
                                ordem: index
                            }
                        });
                        syncResults.push(up);
                    } catch (upsertError: any) {
                        console.error(`API: Erro ao sincronizar categoria ${name}:`, upsertError.message);
                    }
                }

                console.log(`API: Sincronização finalizada. ${syncResults.length} sucessos.`);

                // Busca novamente após criar
                try {
                    categories = await (prisma.category as any).findMany({
                        orderBy: { ordem: 'asc' }
                    });
                } catch (e) {
                    categories = await prisma.category.findMany();
                }
            }
        }

        return NextResponse.json(categories);
    } catch (error: any) {
        console.error('API CATEGORIAS - ERRO FATAL:', error);
        return NextResponse.json({
            error: 'Erro interno na API',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name } = await req.json();
        if (!name) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });

        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                ordem: 99
            }
        });

        return NextResponse.json(category);
    } catch (error: any) {
        console.error('Erro ao criar categoria:', error);
        return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
    }
}
