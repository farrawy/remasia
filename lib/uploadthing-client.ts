'use client';

import {generateUploadButton} from '@uploadthing/react';
import type {OurFileRouter} from '@/lib/uploadthing';

// Typed UploadThing button. Only rendered when UPLOADTHING_TOKEN is configured
// (see BouquetForm `canUpload`). Type-only import keeps server code out of the
// client bundle.
export const UploadButton = generateUploadButton<OurFileRouter>();
