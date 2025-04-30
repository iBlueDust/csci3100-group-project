import { useEffect, useState } from "react"

export interface DeviceInfoHookOptions {
	mobileThreshold?: number
}

export function useDeviceInfo({ mobileThreshold = 768 }: DeviceInfoHookOptions = {}) {
	const [isMobile, setIsMobile] = useState<boolean>(false)

	// use useEffect instead of useLayoutEffect to avoid blocking the browser paint
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < mobileThreshold)
		}

		handleResize() // Set initial state
		window.addEventListener('resize', handleResize)

		return () => {
			window.removeEventListener('resize', handleResize)
		}
	}, [mobileThreshold])

	return { isMobile }
}