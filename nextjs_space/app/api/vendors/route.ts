import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { CreateVendorInput, UpdateVendorInput } from '@/lib/types/vendor'

// GET /api/vendors - List all vendors
export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        assessments: {
          orderBy: { assessment_date: 'desc' },
          take: 1,
        },
        contracts: {
          where: { contract_status: 'ACTIVE' },
        },
        _count: {
          select: {
            assessments: true,
            contracts: true,
            documents: true,
            complianceChecks: true,
          },
        },
      },
      orderBy: { vendor_name: 'asc' },
    })

    return NextResponse.json(vendors)
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    )
  }
}

// POST /api/vendors - Create new vendor
export async function POST(request: Request) {
  try {
    const body: CreateVendorInput = await request.json()

    const vendor = await prisma.vendor.create({
      data: {
        vendor_name: body.vendor_name,
        legal_entity_name: body.legal_entity_name,
        website: body.website,
        headquarters_location: body.headquarters_location,
        primary_contact_name: body.primary_contact_name,
        primary_contact_email: body.primary_contact_email,
        primary_contact_phone: body.primary_contact_phone,
        vendor_status: body.vendor_status || 'ACTIVE',
        services_provided: body.services_provided || [],
        industries_served: body.industries_served || [],
        company_size: body.company_size,
        years_in_business: body.years_in_business,
        notes: body.notes,
      },
    })

    return NextResponse.json(vendor, { status: 201 })
  } catch (error) {
    console.error('Error creating vendor:', error)
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    )
  }
}
