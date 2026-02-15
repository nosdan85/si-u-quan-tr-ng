export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  return NextResponse.json({
    hasUserDelegate: !!(prisma as any).user,
    prismaKeys: Object.keys(prisma as any),
  });
}
