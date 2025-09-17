
'use client'

import { Tldraw, useEditor, TLComponents, TLUiComponents, track, getSvgAsImage } from 'tldraw'
import 'tldraw/tldraw.css'
import { useEffect, useState } from 'react';
import type { Chemical } from '@/lib/chemicals';
import { analyzeWhiteboard } from '@/ai/flows/whiteboardAnalysisFlow';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WhiteboardProps {
    chemicals: Chemical[];
    addMessageToChat: (message: string) => void;
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
			<h2 style={{ marginTop: 0, fontSize: '1.5rem', color: '#333' }}>Welcome to the Invention Canvas!</h2>
			<p style={{ color: '#555', lineHeight: 1.6 }}>
				This is your space to prototype experiments. Your selected chemicals appear as movable blocks.
                Use the tools to draw your apparatus, then click <b>Analyze</b> to get an AI-powered breakdown of your invention.
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
				Let's Invent!
			</button>
		</div>
	)
}

function CustomUi() {
	const editor = useEditor()
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{title: string, apparatus: string, prediction: string} | null>(null);
    const [showWelcome, setShowWelcome] = useState(true);

	const handleAnalyze = async () => {
		setIsLoading(true);
        setAnalysisResult(null);

        try {
            const svg = await editor.getSvg(Array.from(editor.allShapeIds));
            if (!svg) {
                throw new Error('Could not generate SVG from whiteboard content.');
            }
            const image = await getSvgAsImage(svg, { type: 'png', quality: 1, size: { w: 1024, h: 768 } });
            const dataUrl = await image.getDataUrl();

            const result = await analyzeWhiteboard({ diagram: dataUrl });

            const analysisText = `
                ### Whiteboard Analysis: ${result.title}
                **Apparatus:**
                ${result.apparatus}
                **Prediction:**
                ${result.prediction}
            `;

            // Create a shape on the canvas with the analysis
            editor.createShapes([
                {
                    id: 'shape:analysis-result',
                    type: 'text',
                    x: 100,
                    y: editor.viewport.camera.y + editor.viewport.screenBounds.height - 300,
                    props: {
                        text: analysisText,
                        size: 'm',
                        align: 'start',
                        w: 400
                    }
                }
            ]);
            editor.select('shape:analysis-result');
            editor.zoomToSelection();

		} catch (e: any) {
			console.error(e)
            toast({
                variant: 'destructive',
                title: 'Analysis Failed',
                description: e.message || 'Could not analyze whiteboard content.'
            });
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div style={{ position: 'absolute', zIndex: 300, top: '10px', right: '10px', display: 'flex', gap: '10px' }}>
            {showWelcome && <WelcomeMessage onDismiss={() => setShowWelcome(false)} />}
			<button
				onClick={handleAnalyze}
				disabled={isLoading}
				style={{
					backgroundColor: 'white',
					border: '1px solid #ccc',
					padding: '10px 15px',
					borderRadius: '8px',
					cursor: 'pointer',
					display: 'flex',
					alignItems: 'center',
					gap: '8px',
                    fontSize: '14px'
				}}
			>
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
				{isLoading ? 'Analyzing...' : 'Analyze'}
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
                    editor.zoomToSelection({ padding: 2, animation: { duration: 500 }});
                } else if (existingShapes.length <= 1) { // 1 for the initial welcome text
                     editor.zoomToFit({ animation: { duration: 250 } });
                }
			}, 100);

		}, 100)

	}, [editor, chemicals])

	return null;
}


export function Whiteboard({ chemicals, addMessageToChat }: WhiteboardProps) {
	return (
		<div style={{ position: 'absolute', inset: 0 }}>
			<Tldraw 
                components={{
                    UI: CustomUi
                }}
            >
				<Content chemicals={chemicals} />
			</Tldraw>
		</div>
	)
}
