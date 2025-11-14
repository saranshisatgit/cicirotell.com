import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { files } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET single file by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const file = await db.query.files.findFirst({
      where: eq(files.id, id),
      with: {
        category: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}

// PATCH - Update file metadata
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, location, capturedAt, metadata, categoryId } = body;

    // Build update object
    const updateData: {
      name: string;
      location: string | null;
      metadata: string | null;
      capturedAt?: Date;
      categoryId?: string | null;
    } = {
      name,
      location,
      metadata,
    };

    // Handle optional fields
    if (capturedAt) {
      updateData.capturedAt = new Date(capturedAt);
    }

    if (categoryId) {
      updateData.categoryId = categoryId;
    } else {
      updateData.categoryId = null;
    }

    const [updatedFile] = await db
      .update(files)
      .set(updateData)
      .where(eq(files.id, id))
      .returning();

    if (!updatedFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    );
  }
}

// DELETE - Delete file
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // First, get the file to get the R2 key
    const file = await db.query.files.findFirst({
      where: eq(files.id, id),
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete from R2
    const { deleteFile } = await import('@/lib/r2');
    await deleteFile(file.key);

    // Delete from database
    await db.delete(files).where(eq(files.id, id));

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
