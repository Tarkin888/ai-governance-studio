import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { VendorProfileFormData } from '@/types/vendor';

export const dynamic = 'force-dynamic';

// GET /api/vendors/[id] - Get single vendor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;

    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
      include: {
        assessments: {
          orderBy: { assessmentDate: 'desc' },
          take: 5,
        },
        contracts: {
          orderBy: { expiryDate: 'desc' },
          take: 5,
        },
        reviews: {
          orderBy: { reviewDate: 'desc' },
          take: 5,
        },
        incidents: {
          orderBy: { incidentDate: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            assessments: true,
            contracts: true,
            reviews: true,
            incidents: true,
            aiSystems: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(vendor);
  } catch (error: any) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor', details: error?.message },
      { status: 500 }
    );
  }
}

// PUT /api/vendors/[id] - Update vendor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    const data: VendorProfileFormData = await request.json();

    // Verify vendor exists
    const existing = await prisma.vendorProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    const vendor = await prisma.vendorProfile.update({
      where: { id },
      data,
    });

    return NextResponse.json(vendor);
  } catch (error: any) {
    console.error('Error updating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor', details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/vendors/[id] - Delete vendor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;

    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    await prisma.vendorProfile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json(
      { error: 'Failed to delete vendor', details: error?.message },
      { status: 500 }
    );
  }
}




