// Este arquivo busca dados do banco de dados em vez de usar dados estáticos
export const projetos = {}

// Função para carregar projetos do banco de dados
export async function loadProjetosFromDB() {
  try {
    const response = await fetch('/api/projetos', {
      cache: 'no-store' // Não cacheia para sempre ter dados frescos
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
    // Retorna projetos vazio em caso de erro
    return {}
  }
}

// Carrega os projetos quando o módulo é importado
if (typeof window !== 'undefined') {
  // No cliente, carrega os projetos
  loadProjetosFromDB().catch(console.error)
}