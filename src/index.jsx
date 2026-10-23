import { useState, useEffect, createRef, useCallback, useRef } from "react";
import generateUniqueId from "generate-unique-id";
// import "Lax.css";

//thanks https://stackoverflow.com/questions/53446020/how-to-compare-oldvalues-and-newvalues-on-react-hooks-useeffect
function usePrevious(value) {
	const ref = useRef();
	useEffect(() => {
		ref.current = value;
	});
	return ref.current;
}

export const Lax = ({
	children,
	id = false,
	className = "",
	onClick = () => {
		return false;
	},
	debug = false,
	initial = false,
	transitionCenter = false,
	y = 0,
	x = 0,
	clamp = 0,
	scale = 1,
	scaleABS = 1,
	blur = 0,
	opacity = 100,
	sepia = 0,
	offset = 0,
	deadzone = 0,
	opacityDeadzone = 0,
	blurDeadzone = 0,
	transition = 0,
}) => {
	const myRef = createRef();

	// How far the element is from the top of the content
	const [fromTop, setFromTop] = useState(false);

	// The point at which the transition is at its center.
	const [transitionPoint, setTransitionPoint] = useState(0);

	// The height of the element
	const [elementHeight, setElementHeight] = useState(0);

	const [translateY, setTranslateY] = useState(0);
	const [translateX, setTranslateX] = useState(0);
	const [scaleLevel, setScaleLevel] = useState(1);
	const [blurLevel, setBlurLevel] = useState(0);
	const [opacityLevel, setOpacityLevel] = useState(1);
	const [sepiaLevel, setSepiaLevel] = useState(0);

	// The css transition time
	const [transitionTime, setTransitionTime] = useState(0);

	const [addonFilter, setAddonFilter] = useState("");

	const [resizeTimeout, setResizeTimeout] = useState(0);
	const [localId, setLocalId] = useState(id);
	const [localBlurDeadzone, setLocalBlurDeadzone] = useState(blurDeadzone);
	const [localOpacityDeadzone, setLocalOpacityDeadzone] =
		useState(opacityDeadzone);

	const reset = () => {
		setFromTop(0);

		setTransitionPoint(0);

		// setElementHeight(0);

		setTranslateY(0);
		setTranslateX(0);
		setScaleLevel(1);
		setBlurLevel(0);
		setOpacityLevel(1);
		setSepiaLevel(0);
	};

	const initialize = () => {
		// console.log("initialize");
		reset();

		if (!localId) {
			setLocalId(generateUniqueId());
		}

		let position;

		if (myRef && myRef.current) {
			position = myRef.current.getBoundingClientRect();
		} else {
			const element = document.getElementById(localId);
			position = element.getBoundingClientRect();
		}

		if (position) {
			setFromTop(position.y + window.scrollY);
			log(position.y + window.scrollY);
			// setElementHeight(myRef.current.offsetHeight);
			if (elementHeight === 0) {
				setElementHeight(position.height);
			}

			if (initial) {
				setTransitionPoint(position.y + window.scrollY);
			} else if (transitionCenter) {
				if (typeof transitionCenter === "number") {
					setTransitionPoint(transitionCenter);
				} else if (transitionCenter === "bottom") {
					setTransitionPoint(window.innerHeight);
				}
			} else {
				setTransitionPoint(window.innerHeight / 2);
			}
		} else {
			console.log("no position");
		}
	};

	useEffect(() => {
		initialize();

		if (deadzone > 0) {
			setLocalBlurDeadzone(deadzone);
			setLocalOpacityDeadzone(deadzone);
		}

		if (debug) {
			setAddonFilter("saturate(100%)");
		}
	}, []);

	const log = (message) => {
		if (debug) {
			console.log(message);
		}
	};

	const calculateFromCenter = (position, localDeadzone = deadzone) => {
		const distanceFromCenter =
			transitionPoint +
			window.scrollY -
			position -
			elementHeight / 2 +
			offset;

		log("distanceFromCenter " + distanceFromCenter);

		if (Math.abs(distanceFromCenter) > localDeadzone) {
			if (distanceFromCenter > 0) {
				// subtract deadzone from total motion
				return distanceFromCenter - localDeadzone;
			} else {
				return distanceFromCenter + localDeadzone;
			}
		} else {
			return 0; // Return 0 if inside deadzone
		}
	};

	const calculateDeadZone = (position) => {};

	const calculateFromCenterPercent = (position, localDeadzone = deadzone) => {
		const fromCenter = calculateFromCenter(position, localDeadzone);

		let percent;

		if (clamp > 0) {
			percent = fromCenter / (clamp / 2);
		} else {
			percent = fromCenter / transitionPoint;
		}

		if (position < 0) {
			return percent;
		} else {
			return percent;
		}
	};

	const calculateFromCenterPercentABS = (
		position,
		localDeadzone = deadzone,
	) => {
		return Math.abs(calculateFromCenterPercent(position, localDeadzone));
	};

	const scrollHandler = useCallback(
		(event) => {
			// console.log("scrollHandler");
			if (!fromTop) {
				return;
			}
			setTranslateY(calculateFromCenterPercent(fromTop) * y);
			setTranslateX(calculateFromCenterPercent(fromTop) * x);
			setBlurLevel(
				calculateFromCenterPercentABS(fromTop, localBlurDeadzone) *
					blur,
			);
			setSepiaLevel(calculateFromCenterPercentABS(fromTop) * sepia);

			if (opacity < 100) {
				setOpacityLevel(
					1 -
						(calculateFromCenterPercentABS(
							fromTop,
							localOpacityDeadzone,
						) *
							(100 - opacity)) /
							100,
				);
			}

			if (scale < 1) {
				setScaleLevel(
					1 -
						calculateFromCenterPercent(fromTop, deadzone) *
							(1 - scale),
				);
			}

			if (scale > 1) {
				setScaleLevel(
					1 +
						calculateFromCenterPercent(fromTop, deadzone) *
							(scale - 1),
				);
			}

			if (scaleABS < 1) {
				setScaleLevel(
					1 -
						calculateFromCenterPercentABS(fromTop, deadzone) *
							(1 - scaleABS),
				);
			}

			if (scaleABS > 1) {
				setScaleLevel(
					1 +
						calculateFromCenterPercentABS(fromTop, deadzone) *
							(scaleABS - 1),
				);
			}
		},
		[fromTop, deadzone, localBlurDeadzone, localId],
	);

	// Remove the old listener on change
	const prevScrollHandler = usePrevious(scrollHandler);

	useEffect(() => {
		removeEventListener("scroll", prevScrollHandler);
	}, [scrollHandler]);

	// Attempt to handle window re-size
	// useEffect(() => {
	// 	const handleResize = () => {
	// 		clearTimeout(resizeTimeout);

	// 		// reset();
	// 		const localTimeout = setTimeout(() => {
	// 			initialize();
	// 			//window.location.reload()
	// 		}, 500);

	// 		setResizeTimeout(localTimeout);
	// 	};

	// 	window.addEventListener("resize", handleResize);

	// 	return () => window.removeEventListener("resize", handleResize);
	// }, [localId, scrollHandler, resizeTimeout, initialize]);

	useEffect(() => {
		// console.log("fromTop changed");
		removeEventListener("scroll", scrollHandler);
		// removeEventListener("resize", handleResize);

		if (fromTop != 0) {
			// console.log("fromTop changed");
			scrollHandler();

			// Use a timeout so the transition doesn't effect initialization
			setTimeout(() => {
				setTransitionTime(transition);
			}, 500);

			addEventListener("scroll", scrollHandler);

			// addEventListener("resize", handleResize);
		}
	}, [fromTop]);

	return (
		<>
			<div
				style={{
					transform: `translate(${translateX}px, ${translateY}px)`,
					transition: `all ${transitionTime}s`,
					filter: `blur(${blurLevel}px) sepia(${sepiaLevel}) ${addonFilter}`,
					opacity: opacityLevel,
					scale: `${scaleLevel}`,
				}}
				ref={myRef}
				className={"lax laxPosition" + " " + className}
				onClick={onClick}
				id={localId ? localId : undefined}
			>
				{debug && (
					<div
						className="debug"
						style={{
							position: "absolute",
							top: "5px",
							left: "5px",
							color: "red",
							backgroundColor: "black",
							padding: "5px",
						}}
					>
						{Math.round(calculateFromCenterPercent(fromTop) * 100)}%
					</div>
				)}
				{children}
			</div>
		</>
	);
}

export default Lax;
