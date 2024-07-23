import { createClerkClient } from '@clerk/nextjs/server';

const createdClerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export default createdClerkClient;