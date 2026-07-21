import { redirect } from '@sveltejs/kit';
import { get_exercise_stubs } from '$lib/server/tutorial.js';

export function load() {
    const first = get_exercise_stubs()[0];
    redirect(307, `/tutorial/${first.slug}`);
}
