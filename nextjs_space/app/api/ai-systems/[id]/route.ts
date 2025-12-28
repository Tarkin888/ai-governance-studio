import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET: Get single AI system
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id

    const system = await prisma?.aISystem?.findUnique({
      where: { system_id: id },
    })

    if (!system) {
      return NextResponse.json(
        { success: false, error: 'AI system not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: system })
  } catch (error: any) {
    console.error('Error fetching AI system:', error)
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Failed to fetch AI system' },
      { status: 500 }
    )
  }
}

// PUT: Update AI system
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id
    const body = await request?.json()

    // Check if system exists
    const existing = await prisma?.aISystem?.findUnique({
      where: { system_id: id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'AI system not found' },
        { status: 404 }
      )
    }

    // Check for duplicate name (if name is being changed)
    if (body?.system_name && body?.system_name !== existing?.system_name) {
      const duplicate = await prisma?.aISystem?.findUnique({
        where: { system_name: body?.system_name },
      })

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'A system with this name already exists' },
          { status: 400 }
        )
      }
    }

    const system = await prisma?.aISystem?.update({
      where: { system_id: id },
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
        risk_classification: body?.risk_classification,
        modified_by: body?.modified_by,
      },
    })

    return NextResponse.json({ success: true, data: system })
  } catch (error: any) {
    console.error('Error updating AI system:', error)
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Failed to update AI system' },
      { status: 500 }
    )
  }
}

// DELETE: Delete AI system
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id

    const system = await prisma?.aISystem?.findUnique({
      where: { system_id: id },
    })

    if (!system) {
      return NextResponse.json(
        { success: false, error: 'AI system not found' },
        { status: 404 }
      )
    }

    await prisma?.aISystem?.delete({
      where: { system_id: id },
    })

    return NextResponse.json({ success: true, message: 'AI system deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting AI system:', error)
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Failed to delete AI system' },
      { status: 500 }
    )
  }
}
