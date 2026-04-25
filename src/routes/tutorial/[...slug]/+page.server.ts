import { error, redirect } from '@sveltejs/kit';
import { get_exercise_stubs, load_exercise } from '$lib/server/tutorial.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params }) => {
    const exercise = load_exercise(params.slug);
    if (!exercise) error(404, `Tutorial exercise "${params.slug}" not found`);
    return { exercise, stubs: get_exercise_stubs() };
};

export function entries() {
    return get_exercise_stubs().map(({ slug }) => ({ slug }));
}
