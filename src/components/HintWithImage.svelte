<script lang="ts">
    import { createEventDispatcher, onMount, onDestroy } from "svelte";

    export let hint: string = "";
    export let image: string | undefined = undefined;

    let showPopup = false;
    let isMobile = false;
    let popupElement: HTMLElement | null = null;
    let hintElement: HTMLElement | null = null;

    const dispatch = createEventDispatcher();

    // Detect mobile device
    isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    function show() {
        if (image) showPopup = true;
    }

    function hide() {
        showPopup = false;
    }

    function handleClick() {
        if (isMobile && image) {
            showPopup = !showPopup; // Toggle on press for mobile
        }
    }

    // Close popup if clicked outside
    function handleClickOutside(event: MouseEvent) {
        if (popupElement && hintElement && !popupElement.contains(event.target as Node) && !hintElement.contains(event.target as Node)) {
            hide();
        }
    }

    onMount(() => {
        window.addEventListener("click", handleClickOutside);
    });

    onDestroy(() => {
        window.removeEventListener("click", handleClickOutside);
    });
</script>

<div class="hint-container" bind:this={hintElement}>
    <div class="hint" on:mouseenter={!isMobile ? show : undefined} on:mouseleave={!isMobile ? hide : undefined} on:click={handleClick}>
        <strong>Hint:</strong> {hint}
        {#if image}
            <span class="image-indicator">🖼️</span>
        {/if}
    </div>

    {#if showPopup && image}
        <div class="popup" bind:this={popupElement}>
            <img src={image} alt="Hint illustration" />
            {#if isMobile}
                <button class="close-btn" on:click={hide}>×</button>
            {/if}
        </div>
    {/if}
</div>

<style>
    .hint-container {
        position: relative;
        width: 100%;
        max-width: 500px;
        margin-bottom: 20px;
    }

    .hint {
        background: var(--bg-secondary);
        border: 2px solid var(--border-primary);
        border-radius: 8px;
        padding: 15px;
        text-align: center;
        font-size: 16px;
        line-height: 1.4;
        cursor: pointer;
    }

    .hint strong {
        color: var(--green);
    }

    .image-indicator {
        margin-left: 5px;
        font-size: 1.2em;
    }

    .popup {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        background: white;
        border: 2px solid var(--border-primary);
        border-radius: 8px;
        padding: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        max-width: 90vw;
    }

    .popup img {
        max-width: 100%;
        height: auto;
        display: block;
    }

    .close-btn {
        position: absolute;
        top: 5px;
        right: 5px;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        font-size: 16px;
        cursor: pointer;
    }

    @media (max-width: 600px) {
        .hint {
            font-size: 14px;
            padding: 12px;
        }
    }
</style>