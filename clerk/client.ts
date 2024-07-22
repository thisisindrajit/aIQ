import { createClerkClient } from '@clerk/nextjs/server';

const createdClerkClient: ClerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export default createdClerkClient;