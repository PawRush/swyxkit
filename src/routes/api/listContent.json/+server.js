// import { json } from '@sveltejs/kit';
import { listContent } from '$lib/content';
import { contentCacheHeaders } from "$lib/cacheHeaders";

// Prerender this endpoint so it's available as a static JSON file
export const prerender = true;

/**
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ fetch, setHeaders }) {
	let list = await listContent(fetch);
	list = list.map((item) => {
		item.description = item.description.replace(/[[\]]/gm, ' ')
		return item
	});
	setHeaders({...contentCacheHeaders()});
	return new Response(JSON.stringify(list), {
		headers: {
			'content-type': 'application/json; charset=utf-8'
		}
	});
}
