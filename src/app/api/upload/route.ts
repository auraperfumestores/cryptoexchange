import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

/** Issues short-lived client-upload tokens so the browser can upload directly to
 *  Vercel Blob, bypassing the ~4.5MB serverless function request-body limit that
 *  was rejecting larger photos (e.g. full-res iPhone camera shots) with a 413. */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'],
        addRandomSuffix: true,
        maximumSizeInBytes: 15 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error('[upload]', err);
    return NextResponse.json({ error: (err as Error).message || 'Upload failed' }, { status: 400 });
  }
}
