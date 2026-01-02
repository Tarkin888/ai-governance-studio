import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { VendorProfileFormData } from '@/types/vendor';

export const dynamic = 'force-dynamic';

// GET /api/vendors - List all vendors with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const riskTier = searchParams.get('riskTier');
    const approvalStatus = searchParams.get('approvalStatus');
    const onboardingStatus = searchParams.get('onboardingStatus');
    const vendorType = searchParams.get('vendorType');
    const search = searchParams.get('search');

    const where: any = {};

    if (riskTier && riskTier !== 'all') {
      where.riskTier = riskTier;
    }

    if (approvalStatus && approvalStatus !== 'all') {
      where.approvalStatus = approvalStatus;
    }

    if (onboardingStatus && onboardingStatus !== 'all') {
      where.onboardingStatus = onboardingStatus;
    }

    if (vendorType && vendorType !== 'all') {
      where.vendorType = vendorType;
    }

    if (search) {
      where.OR = [
        { vendorName: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const vendors = await prisma.vendorProfile.findMany({
      where,
      include: {
        assessments: {
          orderBy: { assessmentDate: 'desc' },
          take: 1,
        },
        contracts: {
          where: { status: 'Active' },
        },
        incidents: {
          where: { status: { in: ['Open', 'Investigating'] } },
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(vendors);
  } catch (error: any) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/vendors - Create new vendor
export async function POST(request: NextRequest) {
  try {
    const data: VendorProfileFormData = await request.json();

    const vendor = await prisma.vendorProfile.create({
      data: {
        ...data,
        createdBy: 'current-user-id', // TODO: Replace with actual user ID from session
      },
    });

    return NextResponse.json(vendor, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor', details: error?.message },
      { status: 500 }
    );
  }
}

