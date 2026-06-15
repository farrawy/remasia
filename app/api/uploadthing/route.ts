import {createRouteHandler} from 'uploadthing/next';
import {ourFileRouter} from '@/lib/uploadthing';

// The ONLY Route Handler in V1 (UploadThing owns this multipart endpoint).
// Everything else is a Server Action. — prep doc §5.3.
export const {GET, POST} = createRouteHandler({router: ourFileRouter});
