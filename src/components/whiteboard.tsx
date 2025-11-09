
'use client'

import { Tldraw, useEditor, TLComponents, track, TLTextShape, isShapeOfType } from 'tldraw'
import 'tldraw/tldraw.css'
import { useEffect } from 'react';
import type { Chemical } from '@/lib/chemicals';
import { Button } from './ui/button';
import { Sparkles } from 'lucide-react';


export interface WhiteboardCallbacks {
    onSimulate: (textShapes: string[]) => void;
}
interface WhiteboardProps {
    chemicals: Chemical[];
    callbacks: WhiteboardCallbacks | null;
}

const CustomUi = track(({ onSimulate }: { onSimulate: () => void; }) => {
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
			<button type="button" className="tldraw__button" onClick={() => editor.undo()}>Undo</button>
			<button type="button" className="tldraw__button" onClick={() => editor.redo()}>Redo</button>
            <Button size="sm" onClick={onSimulate}><Sparkles className='mr-2 h-4 w-4'/>Simulate from Whiteboard</Button>
		</div>
	)
})

function Content({ chemicals }: Pick<WhiteboardProps, 'chemicals'>) {
	const editor = useEditor()

	useEffect(() => {
		if (!editor) return;

		// A small delay to ensure the editor is ready
		setTimeout(() => {
			const existingShapes = Array.from(editor.getCurrentPageShapeIds());
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
			}

		}, 100)

	}, [editor, chemicals])

	return null;
}


export function Whiteboard({ chemicals, callbacks }: WhiteboardProps) {
    const editorRef = React.useRef<any>(null);

    const handleSimulate = () => {
        if (editorRef.current && callbacks) {
            const editor = editorRef.current;
            const allShapes = editor.getCurrentPageShapes();
            const textShapes = allShapes
                .filter((shape: any): shape is TLTextShape => shape.type === 'text' || (shape.type === 'geo' && shape.props.label))
                .map((shape: TLTextShape) => shape.props.text || shape.props.label);
            callbacks.onSimulate(textShapes);
        }
    };
    
    const components: TLComponents = {
        UI: (props) => <CustomUi {...props} onSimulate={handleSimulate} />,
    }

	return (
		<div style={{ position: 'absolute', inset: 0 }}>
			<Tldraw onMount={(editor) => { editorRef.current = editor; }} components={components}>
				<Content chemicals={chemicals} />
			</Tldraw>
		</div>
	)
}
