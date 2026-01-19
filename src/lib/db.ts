// src/lib/db.ts

import { prisma } from './prisma';

export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  try {
    // prisma.$queryRaw can be called directly with the template parts
    const result = await (prisma.$queryRaw as any)(strings, ...values);
    return { rows: result as any[] };
  } catch (error) {
    console.error('Database error in sql helper:', error);
    throw error;
  }
}