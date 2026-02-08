class DarkState {
    isDark: boolean = $state(false);

    constructor() {
        this.isDark = false;
    }
}

const darkState = new DarkState();

export function useDark() {
    return darkState;
}
