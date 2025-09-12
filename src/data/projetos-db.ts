// Este arquivo usa dados estáticos gerados durante o build para melhor performance
import { projetos as staticProjetos } from './projetos.js'
import type { Projetos } from '@/types/types'

export const projetos = staticProjetos as any

// Função para carregar projetos do banco de dados (fallback)
export async function loadProjetosFromDB() {
  try {
    // Em produção, usa os dados estáticos do build
    if (process.env.NODE_ENV === 'production') {
      return projetos
    }
    
    // Em desenvolvimento, pode tentar buscar dados frescos
    const response = await fetch('/api/projetos', {
      cache: 'force-cache' // Cacheia para melhor performance
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch projetos')
    }
    
    const data = await response.json()
    
    // Atualiza o objeto projetos com os dados do banco
    Object.assign(projetos, data)
    
    return projetos
  } catch (error) {
    console.error('Error loading projetos from database:', error)
    // Retorna projetos estáticos em caso de erro
    return projetos
  }
}

// Carrega os projetos quando o módulo é importado
if (typeof window !== 'undefined') {
  // No cliente, carrega os projetos
  loadProjetosFromDB().catch(console.error)
}