'use client'

import { Tldraw, useEditor } from 'tldraw'
import 'tldraw/tldraw.css'
import { useEffect } from 'react';


function WelcomeMessage() {
	const editor = useEditor()

	useEffect(() => {
		if (!editor) return;

		// A small delay to ensure the editor is ready
		setTimeout(() => {
			const textShape = {
				id: 'text-1',
				type: 'text',
				x: 120,
				y: 180,
				props: {
					text: "Let's plan an experiment!",
					size: 'xl',
					align: 'middle',
				},
			};

			editor.createShapes([textShape]);

			setTimeout(() => {
				editor.select('text-1');
				editor.zoomToSelection({
					padding: 2,
					animation: { duration: 500 },
				});
			}, 100);

		}, 100)

	}, [editor])

	return null;
}


export function Whiteboard() {
	return (
		<div style={{ position: 'absolute', inset: 0 }}>
			<Tldraw>
				<WelcomeMessage />
			</Tldraw>
		</div>
	)
}
