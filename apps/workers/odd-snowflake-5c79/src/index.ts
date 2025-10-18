import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { user } from '@lib/schema';
import { eq } from 'drizzle-orm';

import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage } from 'mimetext/browser';

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
		const sql = neon(env.MY_DATABASE);
		const db = drizzle({ client: sql });

		console.debug('Querying user from database:', userId);
		const res = await db.select().from(user).where(eq(user.id, userId)).limit(1);
		const u = res[0];

		console.debug('Creating email message for user:', u.email);
		const msg = createMimeMessage();
		msg.setSender({ name: 'Sam F Predict', addr: env.EMAIL_FROM });
		msg.setRecipient(u.email);
		msg.setSubject('An email generated in a worker');
		msg.addMessage({
			contentType: 'text/plain',
			data: `Congratulations, you just sent an email from a worker.`,
		});

		console.debug('Sending email to:', u.email);
		var message = new EmailMessage(env.EMAIL_FROM, u.email, msg.asRaw());

		try {
			await env.EMAIL.send(message);
		} catch (e) {
			console.error('Failed to send email:', e);
			if (e instanceof Error === false) {
				console.error(e);
				return new Response('Unknown error occurred');
			}

			return Response.json({ error: e.message });
		}

		console.debug('Email sent successfully to:', u.email);
		return Response.json({ hello: u.name });
	},
} satisfies ExportedHandler<Env>;
