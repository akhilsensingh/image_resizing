import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request, { params }) {
  const { imageId } = params;
  const imagePath = path.join(process.cwd(), 'public', 'resized', imageId);

  if (fs.existsSync(imagePath)) {
    const fileBuffer = fs.readFileSync(imagePath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${imageId}"`,
        'Content-Type': 'image/jpeg',
      },
    });
  } else {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}