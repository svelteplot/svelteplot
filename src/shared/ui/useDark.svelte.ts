class DarkState {
    isDark: boolean = $state(false);

    constructor() {
        this.isDark = false;
    }
}

const darkState = new DarkState();

export default function useDark() {
    return darkState;
}
