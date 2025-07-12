// src/lib/db.ts

import { createClient } from '@vercel/postgres';

export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  // AÇÃO: Crie um NOVO cliente DENTRO da função.
  // Isso garante que cada chamada 'sql' use uma conexão nova e limpa.
  const client = createClient();
  await client.connect();
  
  try {
    const result = await client.sql(strings, ...values);
    return result;
  } finally {
    // E feche essa conexão específica ao final.
    await client.end();
  }
}