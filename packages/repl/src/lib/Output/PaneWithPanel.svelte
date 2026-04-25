<script lang="ts">
	import { Spring } from 'svelte/motion';
	import { SplitPane, type Length } from '@rich_harris/svelte-split-pane';

	const UNIT_REGEX = /(\d+)(?:(px|rem|%|em))/i;

	interface Props {
		panel: string;
		pos?: Length;
		min?: Length;
		max?: Length;
		main?: import('svelte').Snippet;
		header?: import('svelte').Snippet;
		body?: import('svelte').Snippet;
	}

	let {
		panel,
		pos = $bindable('90%'),
		min = '4.2rem',
		max = '-4.2rem',
		main,
		header,
		body
	}: Props = $props();

	let previous_pos = Math.min(normalize(pos), 70);

	let container: HTMLElement;

	// we can't bind to the spring itself, but we
	// can still use the spring to drive `pos`
	const driver = new Spring(normalize(pos), {
		stiffness: 0.2,
		damping: 0.5
	});

	$effect(() => {
		pos = driver.current + '%';
	});

	const toggle = () => {
		const pc = normalize(pos);
		const px = pc * 0.01 * container.clientHeight;

		const open = container.clientHeight - px > 42;

		driver.set(pc, { hard: true });

		if (open) {
			previous_pos = pc;
			driver.set(100);
		} else {
			driver.set(previous_pos);
		}
	};

	function normalize(pos: string) {
		let normalized = +pos.replace(UNIT_REGEX, '$1');

		if (normalized < 0) {
			normalized += 100;
		}

		return normalized;
	}
</script>

<div class="container" bind:this={container}>
	<SplitPane {min} {max} type="rows" bind:pos>
		{#snippet a()}
			<section>
				{@render main?.()}
			</section>
		{/snippet}

		{#snippet b()}
			<section>
				<div class="panel-header">
					<button class="panel-heading raised" onclick={toggle}>
						<svg
							width="1.8rem"
							height="1.8rem"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="m7 15 5 5 5-5" />
							<path d="m7 9 5-5 5 5" />
						</svg>

						{panel}
					</button>

					{@render header?.()}
				</div>

				<div class="panel-body">
					{@render body?.()}
				</div>
			</section>
		{/snippet}
	</SplitPane>
</div>

<style>
	.container {
		width: 100%;
		height: 100%;
	}

	.panel-header {
		height: var(--sk-pane-controls-height);
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0.5rem 0.5rem 1rem;
	}

	.panel-body {
		overflow: auto;
		max-height: calc(100% - var(--sk-pane-controls-height));
	}

	.panel-heading {
		font: var(--sk-font-ui-small);
		text-transform: uppercase;
		height: 3.2rem;
		padding: 0 0.8rem;
		/* flex: 1; */
		text-align: left;
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	section {
		position: relative;
		overflow: hidden;
	}
</style>
