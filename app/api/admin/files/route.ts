import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { files } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { deleteFile } from '@/lib/r2';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    let allFiles;
    if (categoryId) {
      allFiles = await db.query.files.findMany({
        where: eq(files.categoryId, categoryId),
        orderBy: (files, { desc }) => [desc(files.createdAt)],
        with: {
          category: true,
        },
      });
    } else {
      allFiles = await db.query.files.findMany({
        orderBy: (files, { desc }) => [desc(files.createdAt)],
        with: {
          category: true,
        },
      });
    }

    return NextResponse.json(allFiles);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, url, key, size, mimeType, categoryId } = await req.json();

    if (!name || !url || !key) {
      return NextResponse.json(
        { error: 'Name, URL, and key are required' },
        { status: 400 }
      );
    }

    const [file] = await db
      .insert(files)
      .values({
        name,
        url,
        key,
        size,
        mimeType,
        categoryId,
        uploadedBy: session.user.id,
      })
      .returning();

    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    console.error('Error creating file record:', error);
    return NextResponse.json(
      { error: 'Failed to create file record' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Get file info before deleting
    const file = await db.query.files.findFirst({
      where: eq(files.id, id),
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete from R2
    await deleteFile(file.key);

    // Delete from database
    await db.delete(files).where(eq(files.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
