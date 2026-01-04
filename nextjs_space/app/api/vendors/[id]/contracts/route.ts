import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { VendorContractFormData } from '@/types/vendor';

export const dynamic = 'force-dynamic';

// GET /api/vendors/[id]/contracts - Get all contracts for a vendor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;

    const contracts = await prisma.vendorContractProfile.findMany({
      where: { vendorId: id },
      orderBy: { expiryDate: 'desc' },
    });

    return NextResponse.json(contracts);
  } catch (error: any) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contracts', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/vendors/[id]/contracts - Create new contract
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    const data: VendorContractFormData = await request.json();

    // Verify vendor exists
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    const contract = await prisma.vendorContractProfile.create({
      data: {
        ...data,
        vendorId: id,
      },
    });

    return NextResponse.json(contract, { status: 201 });
  } catch (error: any) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { error: 'Failed to create contract', details: error?.message },
      { status: 500 }
    );
  }
}



