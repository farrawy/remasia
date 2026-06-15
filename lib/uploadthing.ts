import {createUploadthing, type FileRouter} from 'uploadthing/next';
import {requireAdmin} from '@/lib/auth';

const f = createUploadthing();

// UploadThing file router (V1). Two upload targets:
//  - bouquetImage: BouquetImage rows (finalized via the finalizeBouquetImages action)
//  - gardenPhoto : original Remasia photos for Remas Garden
// Both are admin-gated. Persisting the returned URLs into the DB happens in a
// Server Action, not here (see prep doc §5.3).
export const ourFileRouter = {
  bouquetImage: f({image: {maxFileSize: '4MB', maxFileCount: 8}})
    .middleware(async () => {
      // TODO(studio): hard-fail when not an admin once Studio auth is wired.
      await requireAdmin();
      return {};
    })
    .onUploadComplete(async () => {
      // No-op: URLs are saved by finalizeBouquetImages().
    }),

  gardenPhoto: f({image: {maxFileSize: '8MB', maxFileCount: 1}})
    .middleware(async () => {
      await requireAdmin();
      return {};
    })
    .onUploadComplete(async () => {
      // No-op: URLs are saved by createSocialPost().
    })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
