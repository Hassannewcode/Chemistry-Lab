'use client'

import { Tldraw } from 'tldraw'
import '@tldraw/tldraw/tldraw.css'

export function Whiteboard() {
	return (
		<div style={{ position: 'absolute', inset: 0 }}>
			<Tldraw />
		</div>
	)
}
