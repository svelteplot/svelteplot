/**
 * this file is based on [dataProvider.ts from sveltejs/language-tools](https://github.com/sveltejs/language-tools/blob/master/packages/language-server/src/plugins/html/dataProvider.ts)
 */

export const globalEvents = [
	{ name: 'onabort' },
	{ name: 'onanimationcancel' },
	{ name: 'onanimationend' },
	{ name: 'onanimationiteration' },
	{ name: 'onanimationstart' },
	{ name: 'onauxclick' },
	{ name: 'onbeforeinput' },
	{ name: 'onblur' },
	{ name: 'oncancel' },
	{ name: 'oncanplay' },
	{ name: 'oncanplaythrough' },
	{ name: 'onchange' },
	{ name: 'onclick' },
	{ name: 'onclose' },
	{ name: 'oncontextmenu' },
	{ name: 'oncopy' },
	{ name: 'oncuechange' },
	{ name: 'oncut' },
	{ name: 'ondblclick' },
	{ name: 'ondrag' },
	{ name: 'ondragend' },
	{ name: 'ondragenter' },
	{ name: 'ondragleave' },
	{ name: 'ondragover' },
	{ name: 'ondragstart' },
	{ name: 'ondrop' },
	{ name: 'ondurationchange' },
	{ name: 'onemptied' },
	{ name: 'onended' },
	{ name: 'onerror' },
	{ name: 'onfocus' },
	{ name: 'onformdata' },
	{ name: 'ongotpointercapture' },
	{ name: 'oninput' },
	{ name: 'oninvalid' },
	{ name: 'onkeydown' },
	{ name: 'onkeypress' },
	{ name: 'onkeyup' },
	{ name: 'onload' },
	{ name: 'onloadeddata' },
	{ name: 'onloadedmetadata' },
	{ name: 'onloadstart' },
	{ name: 'onlostpointercapture' },
	{ name: 'onmousedown' },
	{ name: 'onmouseenter' },
	{ name: 'onmouseleave' },
	{ name: 'onmousemove' },
	{ name: 'onmouseout' },
	{ name: 'onmouseover' },
	{ name: 'onmouseup' },
	{ name: 'onpaste' },
	{ name: 'onpause' },
	{ name: 'onplay' },
	{ name: 'onplaying' },
	{ name: 'onpointercancel' },
	{ name: 'onpointerdown' },
	{ name: 'onpointerenter' },
	{ name: 'onpointerleave' },
	{ name: 'onpointermove' },
	{ name: 'onpointerout' },
	{ name: 'onpointerover' },
	{ name: 'onpointerup' },
	{ name: 'onprogress' },
	{ name: 'onratechange' },
	{ name: 'onreset' },
	{ name: 'onresize' },
	{ name: 'onscroll' },
	{ name: 'onsecuritypolicyviolation' },
	{ name: 'onseeked' },
	{ name: 'onseeking' },
	{ name: 'onselect' },
	{ name: 'onselectionchange' },
	{ name: 'onselectstart' },
	{ name: 'onslotchange' },
	{ name: 'onstalled' },
	{ name: 'onsubmit' },
	{ name: 'onsuspend' },
	{ name: 'ontimeupdate' },
	{ name: 'ontoggle' },
	{ name: 'ontouchcancel' },
	{ name: 'ontouchend' },
	{ name: 'ontouchmove' },
	{ name: 'ontouchstart' },
	{ name: 'ontransitioncancel' },
	{ name: 'ontransitionend' },
	{ name: 'ontransitionrun' },
	{ name: 'ontransitionstart' },
	{ name: 'onvolumechange' },
	{ name: 'onwaiting' },
	{ name: 'onwebkitanimationend' },
	{ name: 'onwebkitanimationiteration' },
	{ name: 'onwebkitanimationstart' },
	{ name: 'onwebkittransitionend' },
	{ name: 'onwheel' }
];

/** @type {{ name: string, description?: string }[]} */
export const svelteEvents = [
	...globalEvents,
	{
		name: 'onintrostart',
		description: 'Available when element has transition'
	},
	{
		name: 'onintroend',
		description: 'Available when element has transition'
	},
	{
		name: 'onoutrostart',
		description: 'Available when element has transition'
	},
	{
		name: 'onoutroend',
		description: 'Available when element has transition'
	}
];

export const svelteAttributes = [
	{
		name: 'bind:innerHTML',
		description: 'Available when contenteditable=true'
	},
	{
		name: 'bind:textContent',
		description: 'Available when contenteditable=true'
	},
	{
		name: 'bind:innerText',
		description: 'Available when contenteditable=true'
	},
	{
		name: 'bind:clientWidth',
		description: 'Available on all visible elements. (read-only)'
	},
	{
		name: 'bind:clientHeight',
		description: 'Available on all visible elements. (read-only)'
	},
	{
		name: 'bind:offsetWidth',
		description: 'Available on all visible elements. (read-only)'
	},
	{
		name: 'bind:offsetHeight',
		description: 'Available on all visible elements. (read-only)'
	},
	{
		name: 'bind:this',
		description:
			'To get a reference to a DOM node, use bind:this. If used on a component, gets a reference to that component instance.'
	}
];

export const sveltekitAttributes = [
	{
		name: 'data-sveltekit-keepfocus',
		description:
			'SvelteKit-specific attribute. Currently focused element will retain focus after navigation. Otherwise, focus will be reset to the body.',
		valueSet: 'v',
		values: [{ name: 'off' }]
	},
	{
		name: 'data-sveltekit-noscroll',
		description: 'SvelteKit-specific attribute. Will prevent scrolling after the link is clicked.',
		valueSet: 'v',
		values: [{ name: 'off' }]
	},
	{
		name: 'data-sveltekit-preload-code',
		description:
			"SvelteKit-specific attribute. Will cause SvelteKit to run the page's load function as soon as the user hovers over the link (on a desktop) or touches it (on mobile), rather than waiting for the click event to trigger navigation.",
		valueSet: 'v',
		values: [
			{ name: 'eager' },
			{ name: 'viewport' },
			{ name: 'hover' },
			{ name: 'tap' },
			{ name: 'off' }
		]
	},
	{
		name: 'data-sveltekit-preload-data',
		description:
			"SvelteKit-specific attribute. Will cause SvelteKit to run the page's load function as soon as the user hovers over the link (on a desktop) or touches it (on mobile), rather than waiting for the click event to trigger navigation.",
		valueSet: 'v',
		values: [{ name: 'hover' }, { name: 'tap' }, { name: 'off' }]
	},
	{
		name: 'data-sveltekit-reload',
		description:
			'SvelteKit-specific attribute. Will cause SvelteKit to do a normal browser navigation which results in a full page reload.',
		valueSet: 'v',
		values: [{ name: 'off' }]
	},
	{
		name: 'data-sveltekit-replacestate',
		description:
			'SvelteKit-specific attribute. Will replace the current `history` entry rather than creating a new one with `pushState` when the link is clicked.',
		valueSet: 'v',
		values: [{ name: 'off' }]
	}
];

export const svelteTags = [
	{
		name: 'svelte:self',
		description:
			'Allows a component to include itself, recursively.\n\nIt cannot appear at the top level of your markup; it must be inside an if or each block to prevent an infinite loop.',
		attributes: []
	},
	{
		name: 'svelte:component',
		description:
			'Renders a component dynamically, using the component constructor specified as the this property. When the property changes, the component is destroyed and recreated.\n\nIf this is falsy, no component is rendered.',
		attributes: [
			{
				name: 'this',
				description:
					'Component to render.\n\nWhen this property changes, the component is destroyed and recreated.\nIf this is falsy, no component is rendered.'
			}
		]
	},
	{
		name: 'svelte:element',
		description:
			'Renders a DOM element dynamically, using the string as the this property. When the property changes, the element is destroyed and recreated.\n\nIf this is falsy, no element is rendered.',
		attributes: [
			{
				name: 'this',
				description:
					'DOM element to render.\n\nWhen this property changes, the element is destroyed and recreated.\nIf this is falsy, no element is rendered.'
			}
		]
	},
	{
		name: 'svelte:window',
		description:
			'Allows you to add event listeners to the window object without worrying about removing them when the component is destroyed, or checking for the existence of window when server-side rendering.',
		attributes: [
			{
				name: 'bind:innerWidth',
				description: 'Bind to the inner width of the window. (read-only)'
			},
			{
				name: 'bind:innerHeight',
				description: 'Bind to the inner height of the window. (read-only)'
			},
			{
				name: 'bind:outerWidth',
				description: 'Bind to the outer width of the window. (read-only)'
			},
			{
				name: 'bind:outerHeight',
				description: 'Bind to the outer height of the window. (read-only)'
			},
			{
				name: 'bind:scrollX',
				description: 'Bind to the scroll x position of the window.'
			},
			{
				name: 'bind:scrollY',
				description: 'Bind to the scroll y position of the window.'
			},
			{
				name: 'bind:online',
				description: 'An alias for window.navigator.onLine'
			},
			// window events
			{ name: 'onafterprint' },
			{ name: 'onbeforeprint' },
			{ name: 'onbeforeunload' },
			{ name: 'ongamepadconnected' },
			{ name: 'ongamepaddisconnected' },
			{ name: 'onhashchange' },
			{ name: 'onlanguagechange' },
			{ name: 'onmessage' },
			{ name: 'onmessageerror' },
			{ name: 'onoffline' },
			{ name: 'ononline' },
			{ name: 'onpagehide' },
			{ name: 'onpageshow' },
			{ name: 'onpopstate' },
			{ name: 'onrejectionhandled' },
			{ name: 'onstorage' },
			{ name: 'onunhandledrejection' },
			{ name: 'onunload' }
		]
	},
	{
		name: 'svelte:document',
		description:
			"As with <svelte:window>, this element allows you to add listeners to events on document, such as visibilitychange, which don't fire on window.",
		attributes: [
			// document events
			{ name: 'onfullscreenchange' },
			{ name: 'onfullscreenerror' },
			{ name: 'onpointerlockchange' },
			{ name: 'onpointerlockerror' },
			{ name: 'onreadystatechange' },
			{ name: 'onvisibilitychange' }
		]
	},
	{
		name: 'svelte:body',
		description:
			"As with <svelte:window>, this element allows you to add listeners to events on document.body, such as mouseenter and mouseleave which don't fire on window.",
		attributes: []
	},
	{
		name: 'svelte:head',
		description:
			'This element makes it possible to insert elements into document.head. During server-side rendering, head content exposed separately to the main html content.',
		attributes: []
	},
	{
		name: 'svelte:options',
		description: 'Provides a place to specify per-component compiler options',
		attributes: [
			{
				name: 'immutable',
				description:
					'If true, tells the compiler that you promise not to mutate any objects. This allows it to be less conservative about checking whether values have changed.',
				values: [
					{
						name: '{true}',
						description:
							'You never use mutable data, so the compiler can do simple referential equality checks to determine if values have changed'
					},
					{
						name: '{false}',
						description:
							'The default. Svelte will be more conservative about whether or not mutable objects have changed'
					}
				]
			},
			{
				name: 'accessors',
				description:
					"If true, getters and setters will be created for the component's props. If false, they will only be created for readonly exported values (i.e. those declared with const, class and function). If compiling with customElement: true this option defaults to true.",
				values: [
					{
						name: '{true}',
						description: "Adds getters and setters for the component's props"
					},
					{
						name: '{false}',
						description: 'The default.'
					}
				]
			},
			{
				name: 'namespace',
				description: 'The namespace where this component will be used, most commonly "svg"'
			},
			{
				name: 'tag',
				description: 'The name to use when compiling this component as a custom element'
			}
		]
	},
	{
		name: 'svelte:fragment',
		description:
			'This element is useful if you want to assign a component to a named slot without creating a wrapper DOM element.',
		attributes: [
			{
				name: 'slot',
				description: 'The name of the named slot that should be targeted.'
			}
		]
	},
	{
		name: 'slot',
		description:
			'Components can have child content, in the same way that elements can.\n\nThe content is exposed in the child component using the <slot> element, which can contain fallback content that is rendered if no children are provided.',
		attributes: [
			{
				name: 'name',
				description:
					'Named slots allow consumers to target specific areas. They can also have fallback content.'
			}
		]
	}
];

const mediaAttributes = [
	{
		name: 'bind:duration',
		description: 'The total duration of the video, in seconds. (readonly)'
	},
	{
		name: 'bind:buffered',
		description: 'An array of {start, end} objects. (readonly)'
	},
	{
		name: 'bind:seekable',
		description: 'An array of {start, end} objects. (readonly)'
	},
	{
		name: 'bind:played',
		description: 'An array of {start, end} objects. (readonly)'
	},
	{
		name: 'bind:seeking',
		description: 'boolean. (readonly)'
	},
	{
		name: 'bind:ended',
		description: 'boolean. (readonly)'
	},
	{
		name: 'bind:currentTime',
		description: 'The current point in the video, in seconds.'
	},
	{
		name: 'bind:playbackRate',
		description: "how fast or slow to play the video, where 1 is 'normal'"
	},
	{
		name: 'bind:paused'
	},
	{
		name: 'bind:volume',
		description: 'A value between 0 and 1'
	},
	{
		name: 'bind:muted'
	},
	{
		name: 'bind:readyState'
	}
];

const videoAttributes = [
	{
		name: 'bind:videoWidth',
		description: 'readonly'
	},
	{
		name: 'bind:videoHeight',
		description: 'readonly'
	}
];

const indeterminateAttribute = {
	name: 'indeterminate',
	description: 'Available for type="checkbox"'
};

/** @type {Record<string, { name: string, description?: string }[]>} */
export const addAttributes = {
	select: [{ name: 'bind:value' }],
	input: [
		{ name: 'bind:value' },
		{ name: 'bind:group', description: 'Available for type="radio" and type="checkbox"' },
		{ name: 'bind:checked', description: 'Available for type="checkbox"' },
		{ name: 'bind:files', description: 'Available for type="file" (readonly)' },
		indeterminateAttribute,
		{ ...indeterminateAttribute, name: 'bind:indeterminate' }
	],
	img: [{ name: 'bind:naturalWidth' }, { name: 'bind:naturalHeight' }],
	textarea: [{ name: 'bind:value' }],
	video: [...mediaAttributes, ...videoAttributes],
	audio: [...mediaAttributes],
	details: [
		{
			name: 'bind:open'
		}
	]
};

/**
 * Returns `true` is this is a valid place to declare state
 * @type {import("./types").Test}
 */
const is_state = (node) => {
	let parent = node.parent;

	if (node.name === '.' || node.name === 'PropertyName') {
		if (parent?.name !== 'MemberExpression') return false;
		parent = parent.parent;
	}

	if (!parent) return false;

	return parent.name === 'VariableDeclaration' || parent.name === 'PropertyDeclaration';
};

/**
 * Returns `true` if we're already in a valid call expression, e.g.
 * changing an existing `$state()` to `$state.raw()`
 * @type {import("./types").Test}
 */
const is_state_call = (node) => {
	let parent = node.parent;

	if (node.name === '.' || node.name === 'PropertyName') {
		if (parent?.name !== 'MemberExpression') return false;
		parent = parent.parent;
	}

	if (parent?.name !== 'CallExpression') {
		return false;
	}

	parent = parent.parent;
	if (!parent) return false;

	return parent.name === 'VariableDeclaration' || parent.name === 'PropertyDeclaration';
};

/** @type {import("./types").Test} */
const is_statement = (node) => {
	if (node.name === 'VariableName') {
		return node.parent?.name === 'ExpressionStatement';
	}

	if (node.name === '.' || node.name === 'PropertyName') {
		return node.parent?.parent?.name === 'ExpressionStatement';
	}

	return false;
};

/**
 * Returns `true` if `$props()` is valid
 * TODO only allow in `.svelte` files, and only at the top level
 * @type {import("./types").Test}
 */
const is_props = (node, _, selected) => {
	if (!selected.endsWith('.svelte')) return false;

	return (
		node.name === 'VariableName' &&
		node.parent?.name === 'VariableDeclaration' &&
		node.parent.parent?.name === 'Script'
	);
};

/**
 * Returns `true` if `$bindable()` is valid
 * @type {import("./types").Test}
 * */
const is_bindable = (node, context) => {
	// disallow outside `let { x = $bindable }`
	if (node.parent?.name !== 'PatternProperty') return false;
	if (node.parent.parent?.name !== 'ObjectPattern') return false;
	if (node.parent.parent.parent?.name !== 'VariableDeclaration') return false;

	let last = node.parent.parent.parent.lastChild;
	if (!last) return true;

	// if the declaration is incomplete, assume the best
	if (last.name === 'ObjectPattern' || last.name === 'Equals' || last.name === '⚠') {
		return true;
	}

	if (last.name === ';') {
		last = last.prevSibling;
		if (!last || last.name === '⚠') return true;
	}

	// if the declaration is complete, only return true if it is a `$props()` declaration
	return (
		last.name === 'CallExpression' &&
		last.firstChild?.name === 'VariableName' &&
		context.state.sliceDoc(last.firstChild.from, last.firstChild.to) === '$props'
	);
};

/**
 * @type {import("./types").Test}
 */
const is_props_id_call = (node, context, selected) => {
	return (
		is_state_call(node, context, selected) && node.parent?.parent?.parent?.parent?.name === 'Script'
	);
};

export const runes = [
	{ snippet: '$state(${})', test: is_state },
	{ snippet: '$state', test: is_state_call },
	{ snippet: '$props()', test: is_props },
	{ snippet: '$props.id', test: is_props_id_call },
	{ snippet: '$props.id()', test: is_props },
	{ snippet: '$derived(${});', test: is_state },
	{ snippet: '$derived', test: is_state_call },
	{ snippet: '$derived.by(() => {\n\t${}\n});', test: is_state },
	{ snippet: '$derived.by', test: is_state_call },
	{ snippet: '$effect(() => {\n\t${}\n});', test: is_statement },
	{ snippet: '$effect.pre(() => {\n\t${}\n});', test: is_statement },
	{ snippet: '$state.raw(${});', test: is_state },
	{ snippet: '$state.raw', test: is_state_call },
	{ snippet: '$bindable()', test: is_bindable },
	{ snippet: '$effect.root(() => {\n\t${}\n})' },
	{ snippet: '$state.snapshot(${})' },
	{ snippet: '$effect.tracking()' },
	{ snippet: '$inspect(${});', test: is_statement },
	{ snippet: '$inspect.trace();', test: is_statement },
	{ snippet: '$inspect.trace(${});', test: is_statement },
	{ snippet: '$host()' }
];
