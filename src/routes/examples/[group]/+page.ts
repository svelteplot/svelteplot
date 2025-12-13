function titleCase(s: string): string {
    return s.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
}

export const load = async ({ params, fetch }) => {
    const { group } = params;
    return { title: `${titleCase(group)} - Examples` };
};
