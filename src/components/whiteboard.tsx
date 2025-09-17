
'use client'

import { Tldraw, useEditor, TLComponents, TLUiComponents, track } from 'tldraw'
import 'tldraw/tldraw.css'
import { useEffect, useState } from 'react';
import type { Chemical } from '@/lib/chemicals';

interface WhiteboardProps {
    chemicals: Chemical[];
}

const WelcomeMessage = ({ onDismiss }: { onDismiss: () => void }) => {
	return (
		<div
			style={{
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				backgroundColor: 'rgba(255, 255, 255, 0.9)',
				padding: '24px',
				borderRadius: '12px',
				boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
				zIndex: 1000,
				textAlign: 'center',
				maxWidth: '400px',
			}}
		>
			<h2 style={{ marginTop: 0, fontSize: '1.5rem', color: '#333' }}>Welcome to the Whiteboard!</h2>
			<p style={{ color: '#555', lineHeight: 1.6 }}>
				This is your space to brainstorm. Use the tools on the left to draw diagrams,
				and find your selected chemicals ready to be arranged on the canvas.
			</p>
			<button
				onClick={onDismiss}
				style={{
					marginTop: '16px',
					padding: '10px 20px',
					border: 'none',
					backgroundColor: '#E91E63',
					color: 'white',
					borderRadius: '8px',
					cursor: 'pointer',
					fontSize: '1rem',
				}}
			>
				Got it!
			</button>
		</div>
	)
}


function Content({ chemicals }: WhiteboardProps) {
	const editor = useEditor()

	useEffect(() => {
		if (!editor) return;

		// A small delay to ensure the editor is ready
		setTimeout(() => {
			if (!editor.allShapeIds) return; // Guard against race condition

			const existingShapes = Array.from(editor.allShapeIds);
			const shapesToCreate: any[] = [];
			const shapeIdsToSelect: string[] = [];
			
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
    const [showWelcome, setShowWelcome] = useState(true);

	return (
		<div style={{ position: 'absolute', inset: 0 }}>
			<Tldraw>
				<Content chemicals={chemicals} />
                 {showWelcome && <WelcomeMessage onDismiss={() => setShowWelcome(false)} />}
			</Tldraw>
		</div>
	)
}
