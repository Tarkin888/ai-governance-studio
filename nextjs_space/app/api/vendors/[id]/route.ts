import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { UpdateVendorInput } from '@/lib/types/vendor'

// GET /api/vendors/[id] - Get single vendor
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const vendor = await prisma.vendor.findUnique({
      where: { vendor_id: id },
      include: {
        assessments: {
          orderBy: { assessment_date: 'desc' },
        },
        contracts: true,
        documents: true,
        complianceChecks: true,
      },
    })

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(vendor)
  } catch (error) {
    console.error('Error fetching vendor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vendor' },
      { status: 500 }
    )
  }
}

// PUT /api/vendors/[id] - Update vendor
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body: UpdateVendorInput = await request.json()

    const vendor = await prisma.vendor.update({
      where: { vendor_id: id },
      data: {
        vendor_name: body.vendor_name,
        legal_entity_name: body.legal_entity_name,
        website: body.website,
        headquarters_location: body.headquarters_location,
        primary_contact_name: body.primary_contact_name,
        primary_contact_email: body.primary_contact_email,
        primary_contact_phone: body.primary_contact_phone,
        vendor_status: body.vendor_status,
        services_provided: body.services_provided,
        industries_served: body.industries_served,
        company_size: body.company_size,
        years_in_business: body.years_in_business,
        notes: body.notes,
      },
    })

    return NextResponse.json(vendor)
  } catch (error) {
    console.error('Error updating vendor:', error)
    return NextResponse.json(
      { error: 'Failed to update vendor' },
      { status: 500 }
    )
  }
}

// DELETE /api/vendors/[id] - Delete vendor
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.vendor.delete({
      where: { vendor_id: id },
    })

    return NextResponse.json(
      { message: 'Vendor deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return NextResponse.json(
      { error: 'Failed to delete vendor' },
      { status: 500 }
    )
  }
}
