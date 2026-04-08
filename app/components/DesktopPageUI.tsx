import React, { forwardRef } from 'react';
import MonthContent from './MonthContent';

const DesktopPageUI = forwardRef((props: any, ref: any) => (
  <div className="calendar-flipbook-page" ref={ref} data-density="soft">
    <div className="flipbook-derotated-page">
      <MonthContent mIdx={props.mIdx} />
    </div>
  </div>
));
DesktopPageUI.displayName = 'DesktopPageUI';

export default DesktopPageUI;
