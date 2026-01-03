export async function load(data) {
    const pkg = data.params.package;
    const tag = data.params.tag;
    const slug = data.params.slug;

    return {
        pkg,
        tag,
        slug,
        sidebarData: {}
    };
}
