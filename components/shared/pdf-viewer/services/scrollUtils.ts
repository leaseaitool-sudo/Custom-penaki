export const scrollToTarget = (targetEl: HTMLElement | null, fallbackEl: HTMLElement | null) => {
    if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    } else if (fallbackEl) {
        fallbackEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }
};
