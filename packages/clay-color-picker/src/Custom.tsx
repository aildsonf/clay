/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

import ClayForm, {ClayInput} from '@clayui/form';
import Icon from '@clayui/icon';
import {TInternalStateOnChange, useInternalState} from '@clayui/shared';
import React from 'react';
import tinycolor from 'tinycolor2';

import GradientSelector from './GradientSelector';
import Hue from './Hue';
import Splotch from './Splotch';
import {useHexInput} from './hooks';

interface IRGBInputProps {
	/**
	 * Callback function for when the input value is changed
	 */
	onChange: (val: {r?: number; g?: number; b?: number}) => void;

	/**
	 * The name of the input. R, G, or B.
	 */
	name: string;

	/**
	 * The value of the input.
	 */
	value: number;
}

/**
 * Renders input that displays RGB values
 */
const RGBInput: React.FunctionComponent<IRGBInputProps> = ({
	name,
	onChange,
	value,
}) => {
	const inputRef = React.useRef(null);
	const [inputValue, setInputValue] = React.useState(value);

	const handleOnChange = (event: any) => {
		const value = event.target.value;

		if (value === '') {
			return;
		}

		let newVal = Number(value);

		if (newVal < 0) {
			newVal = 0;
		} else if (newVal > 255) {
			newVal = 255;
		}

		setInputValue(newVal);

		onChange({[name]: newVal});
	};

	React.useEffect(() => {
		if (document.activeElement !== inputRef.current) {
			setInputValue(value);
		}
	}, [value]);

	return (
		<ClayForm.Group>
			<ClayInput.Group>
				<ClayInput.GroupItem>
					<ClayInput
						data-testid={`${name}Input`}
						insetBefore
						max="255"
						min="0"
						onChange={handleOnChange}
						ref={inputRef}
						type="number"
						value={inputValue}
					/>
					<ClayInput.GroupInsetItem before tag="label">
						{name.toUpperCase()}
					</ClayInput.GroupInsetItem>
				</ClayInput.GroupItem>
			</ClayInput.Group>
		</ClayForm.Group>
	);
};

interface IProps {
	/**
	 * List of hex's that will display as a color splotch
	 */
	colors: Array<string>;

	/**
	 * Label describing the set of colors provided
	 */
	label?: string;

	/**
	 * Callback for when a color is changed
	 */
	onChange: (val: string) => void;

	/**
	 * Callback for when the list of colors is changed
	 */
	onColorsChange: (val: Array<string>) => void;

	/**
	 * Flag for showing and disabling the palette of colors
	 */
	showPalette?: boolean;

	/**
	 * Path to the location of the spritemap resource.
	 */
	spritemap?: string;

	editorActive?: boolean;

	onEditorActiveChange?: TInternalStateOnChange<boolean>;
}

/**
 * Renders the custom color picker
 */
const ClayColorPickerCustom: React.FunctionComponent<IProps> = ({
	colors,
	editorActive,
	label,
	onChange,
	onColorsChange,
	onEditorActiveChange,
	showPalette,
	spritemap,
}) => {
	const inputRef = React.useRef(null);
	const [activeSplotchIndex, setActiveSplotchIndex] = React.useState(0);
	const [internalEditorActive, setInternalEditorActive] = useInternalState({
		initialValue: !showPalette,
		onChange: onEditorActiveChange,
		value: editorActive,
	});

	const color = tinycolor(colors[activeSplotchIndex]);

	const [hue, setHue] = React.useState(color.toHsv().h);
	const [hexInputVal, setHexInput] = useHexInput(color.toHex());

	const {b, g, r} = color.toRgb();
	const {s, v} = color.toHsv();

	const rgbArr: Array<[number, string]> = [
		[r, 'r'],
		[g, 'g'],
		[b, 'b'],
	];

	const setNewColor = (colorValue: tinycolor.Instance, setInput = true) => {
		const hexString = colorValue.toHex();

		const newColors = [...colors];

		newColors[activeSplotchIndex] = hexString;

		onColorsChange(newColors);

		onChange(hexString);

		if (setInput) {
			setHexInput(colorValue.toHex());
		}
	};

	React.useEffect(() => {
		if (inputRef.current !== document.activeElement) {
			setHexInput(color.toHex());
		}
	}, [color]);

	return (
		<>
			{label && (
				<div className="clay-color-header">
					<span className="component-title">{label}</span>

					{showPalette && (
						<button
							className={`${
								internalEditorActive ? 'close' : ''
							} component-action`}
							onClick={() =>
								setInternalEditorActive(!internalEditorActive)
							}
							type="button"
						>
							<Icon
								spritemap={spritemap}
								symbol={internalEditorActive ? 'times' : 'drop'}
							/>
						</button>
					)}
				</div>
			)}

			{showPalette && (
				<div className="clay-color-swatch">
					{colors.map((hex, i) => (
						<div className="clay-color-swatch-item" key={i}>
							<Splotch
								active={i === activeSplotchIndex}
								onClick={() => {
									if (hex === 'FFFFFF') {
										setInternalEditorActive(true);
									}

									setActiveSplotchIndex(i);

									setHue(tinycolor(hex).toHsv().h);

									onChange(hex);
								}}
								value={hex}
							/>
						</div>
					))}
				</div>
			)}

			{editorActive && (
				<>
					<div className="clay-color-map-group">
						<GradientSelector
							color={color}
							hue={hue}
							onChange={(saturation, visibility) => {
								setNewColor(
									tinycolor({
										h: hue,
										s: saturation,
										v: visibility,
									})
								);
							}}
						/>

						<div className="clay-color-map-values">
							{rgbArr.map(([val, key]) => (
								<RGBInput
									key={key}
									name={key}
									onChange={(newVal) => {
										const newColor = tinycolor({
											b,
											g,
											r,
											...newVal,
										});

										setHue(newColor.toHsv().h);
										setNewColor(newColor);
									}}
									value={val}
								/>
							))}
						</div>
					</div>

					<Hue
						onChange={(hue) => {
							setHue(hue);

							setNewColor(tinycolor({h: hue, s, v}));
						}}
						value={hue}
					/>

					<div className="clay-color-footer">
						<ClayForm.Group>
							<ClayInput.Group>
								<ClayInput.GroupItem>
									<ClayInput
										data-testid="customHexInput"
										insetBefore
										onBlur={(event) => {
											const newColor = tinycolor(
												event.target.value
											);

											if (newColor.isValid()) {
												setHexInput(newColor.toHex());
											} else {
												setHexInput(color.toHex());
											}
										}}
										onChange={(event) => {
											const newHexValue =
												event.target.value;

											setHexInput(newHexValue);

											const newColor =
												tinycolor(newHexValue);

											if (newColor.isValid()) {
												setHue(newColor.toHsv().h);
												setNewColor(newColor, false);
											}
										}}
										ref={inputRef}
										type="text"
										value={hexInputVal
											.toUpperCase()
											.substring(0, 6)}
									/>

									<ClayInput.GroupInsetItem
										before
										tag="label"
									>
										#
									</ClayInput.GroupInsetItem>
								</ClayInput.GroupItem>
							</ClayInput.Group>
						</ClayForm.Group>
					</div>
				</>
			)}
		</>
	);
};

export default ClayColorPickerCustom;
