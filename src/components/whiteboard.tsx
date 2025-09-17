'use client'

import { Tldraw, useEditor, TLComponents, TLUiComponents, track } from 'tldraw'
import 'tldraw/tldraw.css'
import { useEffect } from 'react';
import type { Chemical } from '@/lib/chemicals';

interface WhiteboardProps {
    chemicals: Chemical[];
}

const CustomUi = track(() => {
	const editor = useEditor()
	
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'r') {
				if (editor.getSelectedShapes().length > 0) {
					editor.duplicateShapes()
				}
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	})

	return (
		<div
			style={{
				position: 'absolute',
				bottom: 8,
				left: '50%',
				transform: 'translateX(-50%)',
				backgroundColor: 'rgba(255, 255, 255, 0.8)',
				padding: '8px 12px',
				borderRadius: 8,
				boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
				zIndex: 999,
				display: 'flex',
				gap: 8,
			}}
		>
			<button className="tldraw__button" onClick={() => editor.undo()}>Undo</button>
			<button className="tldraw__button" onClick={() => editor.redo()}>Redo</button>
		</div>
	)
})

const components: TLComponents = {
	UI: CustomUi,
}

function Content({ chemicals }: WhiteboardProps) {
	const editor = useEditor()

	useEffect(() => {
		if (!editor) return;

		// A small delay to ensure the editor is ready
		setTimeout(() => {
			const existingShapes = Array.from(editor.getShapeIds());
			const shapesToCreate: any[] = [];
			const shapeIdsToSelect: string[] = [];

			// Create welcome text
			const welcomeTextId = 'shape:welcome-text';
			if (!existingShapes.includes(welcomeTextId)) {
				shapesToCreate.push({
					id: welcomeTextId,
					type: 'text',
					x: 120,
					y: 120,
					props: {
						text: "Let's plan an experiment!",
						size: 'xl',
						align: 'middle',
					},
				});
			}

			// Create shapes for chemicals
			chemicals.forEach((chemical, index) => {
				const shapeId = `shape:chemical-${chemical.formula}`;
				if (!existingShapes.includes(shapeId)) {
					shapesToCreate.push({
						id: shapeId,
						type: 'geo',
						x: 150 + index * 120,
						y: 250,
						props: {
							geo: 'rectangle',
							w: 100,
							h: 100,
							fill: 'solid',
							color: 'light-violet',
							label: chemical.formula,
							size: 'm',
						},
					});
				}
				shapeIdsToSelect.push(shapeId);
			});

			if (shapesToCreate.length > 0) {
				editor.createShapes(shapesToCreate);
			}

			setTimeout(() => {
				if (shapeIdsToSelect.length > 0) {
					editor.select(...shapeIdsToSelect);
					editor.zoomToSelection({
						padding: 2,
						animation: { duration: 500 },
					});
				} else {
					editor.zoomToFit({ animation: { duration: 250 } });
				}
			}, 100);

		}, 100)

	}, [editor, chemicals])

	return null;
}


export function Whiteboard({ chemicals }: WhiteboardProps) {
	return (
		<div style={{ position: 'absolute', inset: 0 }}>
			<Tldraw>
				<Content chemicals={chemicals} />
			</Tldraw>
		</div>
	)
}
