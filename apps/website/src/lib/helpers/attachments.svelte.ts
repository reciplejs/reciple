import type { Attachment } from 'svelte/attachments';

export function scrollToWhenActive(currentHash: string): Attachment {
    return element => {
        if (currentHash === element.id) {
            // TODO: use scrollIntoView
        }
    }
}
