import { NextRequest, NextResponse } from 'next/server';
import { revalidateProjetosCache } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    // Verificar se a requisição tem o token de autorização
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CACHE_INVALIDATION_TOKEN;
    
    if (!authHeader || !expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Invalidar o cache
    await revalidateProjetosCache();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache invalidado com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao invalidar cache:', error);
    return NextResponse.json({ 
      error: 'Erro ao invalidar cache' 
    }, { status: 500 });
  }
}