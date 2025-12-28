import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateCSV } from '@/lib/csv-export'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

// GET: Export AI systems to CSV (respects filters)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request?.nextUrl?.searchParams
    const search = searchParams?.get('search') ?? ''
    const riskFilter = searchParams?.get('risk') ?? ''
    const statusFilter = searchParams?.get('status') ?? ''
    const sortBy = searchParams?.get('sortBy') ?? 'last_modified'
    const sortOrder = searchParams?.get('sortOrder') ?? 'desc'

    // Build where clause (same as GET route)
    const where: Prisma.AISystemWhereInput = {}

    if (search) {
      where.OR = [
        { system_name: { contains: search, mode: 'insensitive' } },
        { system_purpose: { contains: search, mode: 'insensitive' } },
        { business_owner: { contains: search, mode: 'insensitive' } },
        { technical_owner: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (riskFilter) {
      where.risk_classification = riskFilter as any
    }

    if (statusFilter) {
      where.deployment_status = statusFilter as any
    }

    // Build orderBy
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const systems = await prisma?.aISystem?.findMany({
      where,
      orderBy,
    })

    const csv = generateCSV(systems ?? [])

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="ai-systems-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error: any) {
    console.error('Error exporting AI systems:', error)
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Failed to export AI systems' },
      { status: 500 }
    )
  }
}
