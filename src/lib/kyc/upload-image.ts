import { put } from '@vercel/blob';
import { HttpError } from '@/lib/utils/errors';

const MAX_BYTES = 8 * 1024 * 1024;

/** Decodes a base64 data-URI captured client-side (camera/file input, already
 *  downscaled by the browser) and uploads it to Vercel Blob storage. */
export async function uploadKycImage(userId: string, side: string, dataUrl: string): Promise<string> {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl ?? '');
  if (!match) throw new HttpError('Invalid image data', 400);

  const [, mime, base64] = match;
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length === 0) throw new HttpError('Empty image', 400);
  if (buffer.length > MAX_BYTES) throw new HttpError('Image too large', 400);

  const ext = mime.split('/')[1];
  const blob = await put(`kyc/${userId}/${side}-${Date.now()}.${ext}`, buffer, {
    access: 'public',
    contentType: mime,
    addRandomSuffix: true,
  });
  return blob.url;
}
