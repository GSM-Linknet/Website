import React from 'react';
import { renderToString } from 'react-dom/server';
import { DayPicker } from 'react-day-picker';

const out = renderToString(<DayPicker components={{ DayButton: (props) => <button {...props}>TEST</button> }} />);
console.log(out.includes('TEST'));
