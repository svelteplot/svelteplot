<script>
    /** @type {{ [key: string]: any }} */
    const { ...rest } = $props();
</script>

<svg {...rest} width="1em" height="1em" viewBox="0 0 24 24"
    ><g
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        ><path
            stroke-dasharray="36"
            stroke-dashoffset="36"
            d="M12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12"
            ><animate
                fill="freeze"
                attributeName="stroke-dashoffset"
                dur="0.6s"
                values="36;0" /></path
        ><path stroke-dasharray="12" stroke-dashoffset="12" d="M13 11L20 4"
            ><animate
                fill="freeze"
                attributeName="stroke-dashoffset"
                begin="0.6s"
                dur="0.3s"
                values="12;0" /></path
        ><path stroke-dasharray="8" stroke-dashoffset="8" d="M21 3H15M21 3V9"
            ><animate
                fill="freeze"
                attributeName="stroke-dashoffset"
                begin="0.9s"
                dur="0.2s"
                values="8;0" /></path
        ></g
    ></svg>
