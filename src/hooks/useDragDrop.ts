import { useEffect, useMemo, useRef, useState } from "react"


export function useDragDrop<TElement extends HTMLElement = HTMLInputElement>(
	onDrop?: (files?: FileList) => void,
) {
	const dropAreaRef = useRef<TElement>(null)
	const [isDraggingOver, setIsDraggingOver] = useState(false)

	useEffect(() => {
		if (!dropAreaRef.current) return

		const onDragEnterListener = () => {
			setIsDraggingOver(true)
		}
		const onDragLeaveListener = () => {
			setIsDraggingOver(false)
		}
		const onDropListener = (e: DragEvent) => {
			setIsDraggingOver(false)
			onDrop?.(e.dataTransfer?.files)
		}

		const elem = dropAreaRef.current
		elem.addEventListener('dragenter', onDragEnterListener)
		elem.addEventListener('dragleave', onDragLeaveListener)
		elem.addEventListener('dragend', onDragLeaveListener)
		elem.addEventListener('drop', onDropListener)

		return () => {
			elem.removeEventListener('dragenter', onDragEnterListener)
			elem.removeEventListener('dragleave', onDragLeaveListener)
			elem.removeEventListener('dragend', onDragLeaveListener)
			elem.removeEventListener('drop', onDropListener)
		}
	}, [dropAreaRef, onDrop])

	return useMemo(() => ({
		isDraggingOver,
		dropAreaRef,
	}), [isDraggingOver, dropAreaRef])
}