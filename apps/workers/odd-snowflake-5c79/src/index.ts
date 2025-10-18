import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { user } from '@lib/schema';
import { eq } from 'drizzle-orm';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		console.debug('Request received in worker');
		if (request.method !== 'POST') {
			console.error('Invalid request method:', request.method);
			return new Response('Method not allowed', { status: 405 });
		}

		console.debug('Parsing request JSON');
		const { userId } = await request.json<{ userId: string }>();
		if (!userId) {
			console.error('Missing userId in request body');
			return new Response('Missing userId', { status: 400 });
		}

		console.debug('Connecting to database');
		const sql = neon(env.DATABASE_URL);
		const db = drizzle({ client: sql });

		console.debug('Querying user from database:', userId);
		const res = await db.select().from(user).where(eq(user.id, userId)).limit(1);
		const u = res[0];

		return Response.json({ hello: u.name });
	},
} satisfies ExportedHandler<Env>;
