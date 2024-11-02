import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    const width = formData.get('width');
    const height = formData.get('height');
    const format = formData.get('format');
    const watermark = formData.get('watermark');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Create resized directory if it doesn't exist
    const resizedDir = path.join(process.cwd(), 'public', 'resized');
    if (!fs.existsSync(resizedDir)) {
      fs.mkdirSync(resizedDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(process.cwd(), 'public', 'tmp', filename);
    
    // Create tmp directory if it doesn't exist
    const tmpDir = path.join(process.cwd(), 'public', 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // Write the uploaded file to disk
    fs.writeFileSync(filepath, buffer);

    const imageId = uuidv4();
    const outputPath = path.join(process.cwd(), 'public', 'resized', `${imageId}.${format || 'jpg'}`);

    // Get image metadata
    const metadata = await sharp(filepath).metadata();
    
    // Calculate dimensions while maintaining aspect ratio
    let resizeOptions = {};
    if (width || height) {
      resizeOptions.width = width ? parseInt(width) : undefined;
      resizeOptions.height = height ? parseInt(height) : undefined;
      resizeOptions.fit = sharp.fit.inside;
      resizeOptions.withoutEnlargement = true;
    }

    let image = sharp(filepath).resize(resizeOptions);

    if (watermark) {
      const svgBuffer = Buffer.from(`
        <svg width="${width || metadata.width}" height="${height || metadata.height}">
          <style>
            .title { fill: rgba(255, 255, 255, 0.5); font-size: 24px; font-family: sans-serif; }
          </style>
          <text x="50%" y="95%" text-anchor="middle" class="title">${watermark}</text>
        </svg>
      `);
      
      image = image.composite([
        {
          input: svgBuffer,
          top: 0,
          left: 0,
        },
      ]);
    }

    await image
      .toFormat(format || 'jpeg')
      .toFile(outputPath);

    // Clean up the temporary file
    fs.unlinkSync(filepath);

    return NextResponse.json({ 
      imageId: `${imageId}.${format || 'jpg'}`,
      message: 'Image resized successfully' 
    });
  } catch (error) {
    console.error('Image processing error:', error);
    return NextResponse.json(
      { error: 'Image processing failed: ' + error.message },
      { status: 500 }
    );
  }
}