import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { user } from '@lib/schema';
import { and, eq, isNull } from 'drizzle-orm';

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		if (request.method === 'POST' && url.pathname === '/upload') {
			return await handleUpload(request, env);
		}

		if (request.method === 'GET' && url.pathname.startsWith('/images/')) {
			const id = url.pathname.replace('/images/', '');
			return await handleGetImage(id, env);
		}

		return new Response('Not found', { status: 404 });
	},
};

async function handleUpload(request: Request, env: Env): Promise<Response> {
	const contentType = request.headers.get('content-type') || '';
	if (!contentType.includes('multipart/form-data')) {
		console.error('Invalid content-type:', contentType);
		return new Response('Expected multipart/form-data', { status: 400 });
	}

	const formData = await request.formData();
	const profile = formData.get('profile') as File | null;
	const userId = formData.get('userId') as string | null;

	if (!profile || !userId) {
		console.error('Missing file or userId:', { profile, userId });
		return new Response('Missing file or userId', { status: 400 });
	}

	// Verify user exists in database
	const sql = neon(env.DATABASE_URL);
	const db = drizzle({ client: sql });

	console.debug('Querying user from database:', userId);
	const res = await db
		.select()
		.from(user)
		.where(and(eq(user.id, userId), isNull(user.image)))
		.limit(1);
	const u = res[0];

	if (!u) {
		console.error('User not found or already has an image:', userId);
		return new Response(JSON.stringify({ error: 'Invalid user' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	// User verified → upload image
	const ext = getExtension(profile.type);
	const key = `${userId}${ext}`;

	await env.images.put(key, profile.stream(), {
		httpMetadata: { contentType: profile.type },
	});

	const imageUrl = `${new URL(request.url).origin}/images/${key}`;

	await db.update(user).set({ image: imageUrl }).where(eq(user.id, userId));

	console.log('Uploaded image for user:', userId, imageUrl);

	return new Response(JSON.stringify({ url: imageUrl }), {
		headers: { 'Content-Type': 'application/json' },
	});
}

async function handleGetImage(key: string, env: Env): Promise<Response> {
	const obj = await env.images.get(key);
	if (!obj) {
		return new Response('Not found', { status: 404 });
	}

	const headers = new Headers();
	obj.writeHttpMetadata(headers);
	headers.set('etag', obj.httpEtag);

	return new Response(obj.body, { headers });
}

function getExtension(mimeType: string): string {
	const map: Record<string, string> = {
		'image/jpeg': '.jpg',
		'image/png': '.png',
		'image/gif': '.gif',
		'image/webp': '.webp',
		'image/avif': '.avif',
	};
	return map[mimeType] || '';
}
