import type { ComponentType } from 'react';
import Slide01Title from './slides/Slide01Title';
import Slide02Problem from './slides/Slide02Problem';
import Slide03Existing from './slides/Slide03Existing';
import Slide04Solution from './slides/Slide04Solution';
import Slide05HowItWorks from './slides/Slide05HowItWorks';
import Slide06Boat from './slides/Slide06Boat';
import Slide07Sensors from './slides/Slide07Sensors';
import Slide08Architecture from './slides/Slide08Architecture';
import Slide09CitizenApp from './slides/Slide09CitizenApp';
import Slide10Dashboard from './slides/Slide10Dashboard';
import Slide11GPSMapping from './slides/Slide11GPSMapping';
import Slide12Treatment from './slides/Slide12Treatment';
import Slide13AI from './slides/Slide13AI';
import Slide14Impact from './slides/Slide14Impact';
import Slide15Feasibility from './slides/Slide15Feasibility';
import Slide16Conclusion from './slides/Slide16Conclusion';

export interface SlideMeta {
  id: number;
  title: string;
  component: ComponentType;
}

export const SLIDES: SlideMeta[] = [
  { id: 1, title: 'Title', component: Slide01Title },
  { id: 2, title: 'Problem Statement', component: Slide02Problem },
  { id: 3, title: 'Existing System', component: Slide03Existing },
  { id: 4, title: 'Proposed Solution', component: Slide04Solution },
  { id: 5, title: 'How JalDrishti Works', component: Slide05HowItWorks },
  { id: 6, title: 'Smart Monitoring Boat', component: Slide06Boat },
  { id: 7, title: 'Sensors & Technology', component: Slide07Sensors },
  { id: 8, title: 'System Architecture', component: Slide08Architecture },
  { id: 9, title: 'Citizen Mobile App', component: Slide09CitizenApp },
  { id: 10, title: 'Officer Dashboard', component: Slide10Dashboard },
  { id: 11, title: 'GPS Pollution Mapping', component: Slide11GPSMapping },
  { id: 12, title: 'Treatment Support', component: Slide12Treatment },
  { id: 13, title: 'AI & Smart Analytics', component: Slide13AI },
  { id: 14, title: 'Impact & Benefits', component: Slide14Impact },
  { id: 15, title: 'Feasibility & Scalability', component: Slide15Feasibility },
  { id: 16, title: 'Future Scope & Conclusion', component: Slide16Conclusion },
];
