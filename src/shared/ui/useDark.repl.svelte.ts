// useDark.svelte.ts
const browser = typeof window !== 'undefined' && typeof document !== 'undefined';

class DarkState {
    isDark: boolean = $state(false);

    private observer: MutationObserver | null = null;
    private started = false;

    private syncFromBody() {
        if (!browser || !document.body) return;
        this.isDark = document.body.classList.contains('dark');
    }

    start() {
        if (!browser || this.started) return;
        this.started = true;

        // initial value
        this.syncFromBody();

        // watch <body class="...">
        this.observer = new MutationObserver(() => this.syncFromBody());
        this.observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    stop() {
        this.observer?.disconnect();
        this.observer = null;
        this.started = false;
    }
}

const darkState = new DarkState();

export default function useDark() {
    darkState.start(); // lazy init
    return darkState;
}
