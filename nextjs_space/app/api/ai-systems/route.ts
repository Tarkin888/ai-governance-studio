import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

// GET: List AI systems with search and filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request?.nextUrl?.searchParams
    const search = searchParams?.get('search') ?? ''
    const riskFilter = searchParams?.get('risk') ?? ''
    const statusFilter = searchParams?.get('status') ?? ''
    const sortBy = searchParams?.get('sortBy') ?? 'last_modified'
    const sortOrder = searchParams?.get('sortOrder') ?? 'desc'

    // Build where clause
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

    return NextResponse.json({ success: true, data: systems ?? [] })
  } catch (error: any) {
    console.error('Error fetching AI systems:', error)
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Failed to fetch AI systems' },
      { status: 500 }
    )
  }
}

// POST: Create a new AI system
export async function POST(request: NextRequest) {
  try {
    const body = await request?.json()

    // Check for duplicate system name
    const existing = await prisma?.aISystem?.findUnique({
      where: { system_name: body?.system_name },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A system with this name already exists' },
        { status: 400 }
      )
    }

    const system = await prisma?.aISystem?.create({
      data: {
        system_name: body?.system_name,
        system_purpose: body?.system_purpose,
        business_owner: body?.business_owner,
        technical_owner: body?.technical_owner,
        ai_model_type: body?.ai_model_type,
        deployment_status: body?.deployment_status,
        deployment_date: body?.deployment_date ? new Date(body?.deployment_date) : null,
        data_sources: body?.data_sources ?? [],
        vendor_provider: body?.vendor_provider ?? null,
        integration_points: body?.integration_points ?? null,
        processing_volume: body?.processing_volume,
        risk_classification: body?.risk_classification ?? 'NOT_YET_ASSESSED',
        modified_by: body?.modified_by,
      },
    })

    return NextResponse.json({ success: true, data: system })
  } catch (error: any) {
    console.error('Error creating AI system:', error)
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Failed to create AI system' },
      { status: 500 }
    )
  }
}
