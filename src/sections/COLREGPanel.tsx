import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, AlertTriangle, ChevronDown, ChevronUp, Navigation, Flag } from 'lucide-react';

interface COLREGRule {
  rule: string;
  title: string;
  description: string;
  action?: string;
}

const colregRules: COLREGRule[] = [
  {
    rule: 'Rule 5',
    title: 'Look-out',
    description: 'Every vessel shall at all times maintain a proper look-out by sight and hearing as well as by all available means appropriate in the prevailing circumstances and conditions so as to make a full appraisal of the situation and of the risk of collision.',
    action: 'Maintain continuous visual and auditory watch'
  },
  {
    rule: 'Rule 6',
    title: 'Safe Speed',
    description: 'Every vessel shall at all times proceed at a safe speed so that she can take proper and effective action to avoid collision and be stopped within a distance appropriate to the prevailing circumstances and conditions.',
    action: 'Adjust speed based on visibility, traffic, maneuverability, and conditions'
  },
  {
    rule: 'Rule 7',
    title: 'Risk of Collision',
    description: 'Every vessel shall use all available means appropriate to the prevailing circumstances and conditions to determine if risk of collision exists. If in doubt, assume risk exists.',
    action: 'Use radar, visual bearings, and CPA calculations'
  },
  {
    rule: 'Rule 8',
    title: 'Action to Avoid Collision',
    description: 'Any action taken to avoid collision shall be taken in accordance with the Rules and be positive, made in ample time, and with due regard to good seamanship.',
    action: 'Alter course and/or speed early and substantially'
  },
  {
    rule: 'Rule 9',
    title: 'Narrow Channels',
    description: 'A vessel proceeding along a narrow channel shall keep as near to the outer limit of the channel on her starboard side as is safe and practicable.',
    action: 'Keep to starboard side of channel'
  },
  {
    rule: 'Rule 13',
    title: 'Overtaking',
    description: 'Any vessel overtaking any other shall keep out of the way of the vessel being overtaken.',
    action: 'Overtaking vessel is give-way vessel'
  },
  {
    rule: 'Rule 14',
    title: 'Head-on Situation',
    description: 'When two power-driven vessels are meeting on reciprocal or nearly reciprocal courses so as to involve risk of collision, each shall alter her course to starboard so that each shall pass on the port side of the other.',
    action: 'Both vessels alter course to starboard'
  },
  {
    rule: 'Rule 15',
    title: 'Crossing Situation',
    description: 'When two power-driven vessels are crossing so as to involve risk of collision, the vessel which has the other on her own starboard side shall keep out of the way.',
    action: 'Vessel with other on starboard side is give-way vessel'
  },
  {
    rule: 'Rule 16',
    title: 'Action by Give-way Vessel',
    description: 'Every vessel which is directed to keep out of the way of another vessel shall, so far as possible, take early and substantial action to keep well clear.',
    action: 'Take early and substantial avoiding action'
  },
  {
    rule: 'Rule 17',
    title: 'Action by Stand-on Vessel',
    description: 'When one vessel is to keep out of the way, the other shall keep her course and speed. If the give-way vessel fails to act, the stand-on vessel shall take such action as will best aid to avoid collision.',
    action: 'Maintain course/speed until collision imminent, then act'
  },
  {
    rule: 'Rule 18',
    title: 'Responsibilities Between Vessels',
    description: 'Power-driven vessels shall keep out of the way of: vessels not under command, vessels restricted in ability to maneuver, vessels engaged in fishing, sailing vessels.',
    action: 'Hierarchy: NUC > RAM > Fishing > Sailing > Power'
  },
  {
    rule: 'Rule 19',
    title: 'Conduct in Restricted Visibility',
    description: 'In or near areas of restricted visibility, every vessel shall proceed at a safe speed adapted to the prevailing circumstances. Power-driven vessels shall have engines ready for immediate maneuver.',
    action: 'Reduce speed, sound signals, radar watch, engines ready'
  }
];

// Light symbols using emoji - VERTICAL stack for some
const LightWhite = () => <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white border border-gray-400"></span>;
const LightRed = () => <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 border border-red-700"></span>;
const LightGreen = () => <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-500 border border-green-700"></span>;
const LightYellow = () => <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-yellow-400 border border-yellow-600"></span>;

// Shape symbols
const ShapeBall = () => <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-black border border-gray-600"></span>;
const ShapeCone = () => <span className="inline-flex items-center justify-center w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-black"></span>;
const ShapeCylinder = () => <span className="inline-flex items-center justify-center w-3 h-5 bg-black border border-gray-600 rounded-sm"></span>;
const ShapeDiamond = () => <span className="inline-flex items-center justify-center w-4 h-4 bg-black transform rotate-45"></span>;

// Vertical stack component for lights
const LightStack = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex flex-col items-center gap-0.5 mx-1">{children}</span>
);

interface LightPattern {
  name: string;
  lights: React.ReactNode;
  shapes: React.ReactNode;
}

const lightPatterns: LightPattern[] = [
  {
    name: 'Power-driven Vessel Underway',
    lights: <><LightWhite/> Masthead + <LightRed/><LightGreen/> Sidelights + <LightWhite/> Stern</>,
    shapes: <>None</>
  },
  {
    name: 'Vessel Not Under Command (NUC)',
    lights: <><LightStack><LightRed/><LightRed/></LightStack> + <LightRed/><LightGreen/> Sidelights</>,
    shapes: <><ShapeBall/><br/><ShapeBall/> Two balls</>
  },
  {
    name: 'Vessel Restricted in Ability to Maneuver (RAM)',
    lights: <><LightStack><LightRed/><LightWhite/><LightRed/></LightStack> + <LightRed/><LightGreen/> Sidelights</>,
    shapes: <><ShapeBall/><ShapeDiamond/><ShapeBall/> Ball-Diamond-Ball</>
  },
  {
    name: 'Vessel Constrained by Draft',
    lights: <><LightStack><LightRed/><LightRed/><LightRed/></LightStack> + <LightWhite/> Masthead</>,
    shapes: <><ShapeCylinder/> Cylinder</>
  },
  {
    name: 'Vessel Engaged in Fishing',
    lights: <><LightStack><LightRed/><LightWhite/></LightStack> + <LightRed/><LightGreen/> Sidelights</>,
    shapes: <><ShapeCone/><ShapeCone/> Two cones (points together)</>
  },
  {
    name: 'Vessel at Anchor',
    lights: <><LightWhite/> All-round white</>,
    shapes: <><ShapeBall/> Ball</>
  },
  {
    name: 'Vessel Aground',
    lights: <><LightStack><LightRed/><LightRed/></LightStack> + Anchor lights</>,
    shapes: <><ShapeBall/><ShapeBall/><ShapeBall/> Three balls</>
  },
  {
    name: 'Sailing Vessel Underway',
    lights: <><LightRed/><LightGreen/> Sidelights + <LightWhite/> Sternlight</>,
    shapes: <>None (or <ShapeCone/> if motor-sailing)</>
  },
  {
    name: 'Vessel Towing / Pushing',
    lights: <><LightStack><LightYellow/><LightYellow/></LightStack> + <LightWhite/> Masthead</>,
    shapes: <><ShapeDiamond/> Diamond</>
  }
];

const soundSignals = [
  { situation: 'Power vessel underway', signal: 'One prolonged blast (4-6 sec) every 2 min' },
  { situation: 'Power vessel stopped', signal: 'Two prolonged blasts every 2 min' },
  { situation: 'Vessel not under command', signal: 'One prolonged + two short blasts every 2 min' },
  { situation: 'Vessel restricted in ability to maneuver', signal: 'One prolonged + two short blasts every 2 min' },
  { situation: 'Vessel constrained by draft', signal: 'One prolonged + three short blasts every 2 min' },
  { situation: 'Vessel at anchor', signal: 'Bell 5 sec rapid ringing every 1 min (<100m)' },
  { situation: 'Vessel aground', signal: 'Bell + three separate strokes before and after' },
  { situation: 'Pilot vessel on duty', signal: 'Four short blasts' },
  { situation: 'Danger signal', signal: 'Five or more short rapid blasts' },
  { situation: 'Turning to starboard', signal: 'One short blast' },
  { situation: 'Turning to port', signal: 'Two short blasts' },
  { situation: 'Going astern', signal: 'Three short blasts' }
];

// International Code of Signals - Letter Flags with CORRECT patterns
interface FlagData {
  letter: string;
  name: string;
  meaning: string;
  colors: string[];
  pattern: 'horizontal' | 'vertical' | 'checkered' | 'swallowtail';
}

const letterFlags: FlagData[] = [
  { letter: 'A', name: 'Alfa', meaning: 'I have a diver down; keep well clear at slow speed', colors: ['#ffffff', '#0000ff'], pattern: 'horizontal' },
  { letter: 'B', name: 'Bravo', meaning: 'I am taking in or discharging or carrying dangerous goods', colors: ['#ff0000'], pattern: 'horizontal' },
  { letter: 'C', name: 'Charlie', meaning: 'Yes (affirmative)', colors: ['#0000ff', '#ffffff', '#ff0000'], pattern: 'horizontal' },
  { letter: 'D', name: 'Delta', meaning: 'Keep clear of me; I am maneuvering with difficulty', colors: ['#ffff00'], pattern: 'horizontal' },
  { letter: 'E', name: 'Echo', meaning: 'I am altering my course to starboard', colors: ['#0000ff', '#ff0000'], pattern: 'horizontal' },
  { letter: 'F', name: 'Foxtrot', meaning: 'I am disabled; communicate with me', colors: ['#ffffff', '#ff0000', '#ffffff'], pattern: 'horizontal' },
  { letter: 'G', name: 'Golf', meaning: 'I require a pilot', colors: ['#ffff00', '#0000ff'], pattern: 'horizontal' },
  { letter: 'H', name: 'Hotel', meaning: 'I have a pilot on board', colors: ['#ffffff', '#ff0000'], pattern: 'horizontal' },
  { letter: 'I', name: 'India', meaning: 'I am altering my course to port', colors: ['#ffff00'], pattern: 'horizontal' },
  { letter: 'J', name: 'Juliet', meaning: 'I am on fire and have dangerous cargo; keep clear', colors: ['#0000ff', '#ffffff', '#0000ff'], pattern: 'horizontal' },
  { letter: 'K', name: 'Kilo', meaning: 'I wish to communicate with you', colors: ['#ffff00', '#0000ff'], pattern: 'horizontal' },
  { letter: 'L', name: 'Lima', meaning: 'You should stop your vessel instantly', colors: ['#ffff00', '#000000'], pattern: 'horizontal' },
  { letter: 'M', name: 'Mike', meaning: 'My vessel is stopped and making no way', colors: ['#ffffff'], pattern: 'horizontal' },
  { letter: 'N', name: 'November', meaning: 'No (negative)', colors: ['#0000ff', '#ffffff'], pattern: 'horizontal' },
  { letter: 'O', name: 'Oscar', meaning: 'Man overboard', colors: ['#ffff00', '#ff0000'], pattern: 'horizontal' },
  { letter: 'P', name: 'Papa', meaning: 'In harbor: All persons should report on board', colors: ['#0000ff'], pattern: 'horizontal' },
  { letter: 'Q', name: 'Quebec', meaning: 'My vessel is healthy; I request free pratique', colors: ['#ffff00'], pattern: 'horizontal' },
  { letter: 'R', name: 'Romeo', meaning: 'None (used for distance signals)', colors: ['#ff0000', '#ffffff', '#0000ff'], pattern: 'horizontal' },
  { letter: 'S', name: 'Sierra', meaning: 'I am operating astern propulsion', colors: ['#ffffff', '#0000ff'], pattern: 'horizontal' },
  { letter: 'T', name: 'Tango', meaning: 'Keep clear of me; I am engaged in pair trawling', colors: ['#ff0000', '#ffffff', '#ff0000'], pattern: 'horizontal' },
  { letter: 'U', name: 'Uniform', meaning: 'You are running into danger', colors: ['#ff0000', '#ffffff'], pattern: 'horizontal' },
  { letter: 'V', name: 'Victor', meaning: 'I require assistance', colors: ['#ffffff', '#ff0000', '#ffffff', '#ff0000', '#ffffff'], pattern: 'horizontal' },
  { letter: 'W', name: 'Whiskey', meaning: 'I require medical assistance', colors: ['#0000ff', '#ffffff', '#0000ff', '#ffffff', '#0000ff'], pattern: 'horizontal' },
  { letter: 'X', name: 'X-ray', meaning: 'Stop carrying out your intentions and watch for my signals', colors: ['#ffffff', '#0000ff'], pattern: 'horizontal' },
  { letter: 'Y', name: 'Yankee', meaning: 'I am dragging my anchor', colors: ['#ffff00'], pattern: 'horizontal' },
  { letter: 'Z', name: 'Zulu', meaning: 'I require a tug', colors: ['#ffff00', '#000000', '#ffff00', '#000000', '#ffff00'], pattern: 'horizontal' },
];

// Number pennants - CORRECT patterns
const numberPennants = [
  { number: '0', colors: ['#ffff00'] },
  { number: '1', colors: ['#ffffff', '#ff0000', '#ffffff'] },
  { number: '2', colors: ['#0000ff', '#ffffff', '#0000ff'] },
  { number: '3', colors: ['#ff0000', '#ffffff', '#ff0000'] },
  { number: '4', colors: ['#ffff00', '#ffffff', '#ffff00'] },
  { number: '5', colors: ['#000000', '#ffffff', '#000000'] },
  { number: '6', colors: ['#ffffff', '#0000ff', '#ffffff'] },
  { number: '7', colors: ['#ffff00', '#0000ff', '#ffff00'] },
  { number: '8', colors: ['#ff0000', '#0000ff', '#ff0000'] },
  { number: '9', colors: ['#0000ff', '#ffff00', '#0000ff'] },
];

// Flag SVG Component - CORRECT with special patterns
function FlagSVG({ flag }: { flag: FlagData }) {
  const width = 44;
  const height = 36;

  // Special patterns for certain flags
  if (flag.letter === 'I') {
    // India - yellow with black circle
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-shrink-0">
        <path d={`M0,0 L${width-8},0 L${width},${height/2} L${width-8},${height} L0,${height} Z`} fill="#ffff00" />
        <circle cx={width/2} cy={height/2} r="7" fill="#000000" />
        <path d={`M0,0 L${width-8},0 L${width},${height/2} L${width-8},${height} L0,${height} Z`} fill="none" stroke="#444" strokeWidth="1" />
      </svg>
    );
  }

  if (flag.letter === 'M') {
    // Mike - white with blue cross
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-shrink-0">
        <path d={`M0,0 L${width-8},0 L${width},${height/2} L${width-8},${height} L0,${height} Z`} fill="#ffffff" />
        <rect x={width/2 - 3} y="3" width="6" height={height-6} fill="#0000ff" />
        <rect x="4" y={height/2 - 3} width={width-12} height="6" fill="#0000ff" />
        <path d={`M0,0 L${width-8},0 L${width},${height/2} L${width-8},${height} L0,${height} Z`} fill="none" stroke="#444" strokeWidth="1" />
      </svg>
    );
  }

  if (flag.letter === 'P') {
    // Papa - blue with white square
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-shrink-0">
        <path d={`M0,0 L${width-8},0 L${width},${height/2} L${width-8},${height} L0,${height} Z`} fill="#0000ff" />
        <rect x={width/2 - 6} y={height/2 - 6} width="12" height="12" fill="#ffffff" />
        <path d={`M0,0 L${width-8},0 L${width},${height/2} L${width-8},${height} L0,${height} Z`} fill="none" stroke="#444" strokeWidth="1" />
      </svg>
    );
  }

  if (flag.letter === 'Y') {
    // Yankee - yellow with red diagonal
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-shrink-0">
        <path d={`M0,0 L${width-8},0 L${width},${height/2} L${width-8},${height} L0,${height} Z`} fill="#ffff00" />
        <line x1="4" y1={height-4} x2={width-4} y2="4" stroke="#ff0000" strokeWidth="5" />
        <path d={`M0,0 L${width-8},0 L${width},${height/2} L${width-8},${height} L0,${height} Z`} fill="none" stroke="#444" strokeWidth="1" />
      </svg>
    );
  }

  if (flag.letter === 'X') {
    // X-ray - white with blue cross
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-shrink-0">
        <path d={`M0,0 L${width-8},0 L${width},${height/2} L${width-8},${height} L0,${height} Z`} fill="#ffffff" />
        <rect x={width/2 - 3} y="3" width="6" height={height-6} fill="#0000ff" />
        <rect x="4" y={height/2 - 3} width={width-12} height="6" fill="#0000ff" />
        <path d={`M0,0 L${width-8},0 L${width},${height/2} L${width-8},${height} L0,${height} Z`} fill="none" stroke="#444" strokeWidth="1" />
      </svg>
    );
  }

  // Standard horizontal stripes
  const stripeHeight = height / flag.colors.length;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-shrink-0">
      <defs>
        <clipPath id={`flag-clip-${flag.letter}`}>
          <path d={`M0,0 L${width-8},0 L${width},${height/2} L${width-8},${height} L0,${height} Z`} />
        </clipPath>
      </defs>
      <g clipPath={`url(#flag-clip-${flag.letter})`}>
        {flag.colors.map((color, i) => (
          <rect
            key={i}
            x="0"
            y={i * stripeHeight}
            width={width}
            height={stripeHeight}
            fill={color}
          />
        ))}
      </g>
      <path d={`M0,0 L${width-8},0 L${width},${height/2} L${width-8},${height} L0,${height} Z`} fill="none" stroke="#444" strokeWidth="1" />
    </svg>
  );
}

// Pennant SVG Component
function PennantSVG({ colors }: { colors: string[] }) {
  const width = 50;
  const height = 24;
  const stripeHeight = height / colors.length;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-shrink-0">
      <defs>
        <clipPath id="pennant-clip">
          <path d={`M0,0 L${width-12},0 L${width},${height/2} L${width-12},${height} L0,${height} Z`} />
        </clipPath>
      </defs>
      <g clipPath="url(#pennant-clip)">
        {colors.map((color, i) => (
          <rect
            key={i}
            x="0"
            y={i * stripeHeight}
            width={width}
            height={stripeHeight}
            fill={color}
          />
        ))}
      </g>
      <path d={`M0,0 L${width-12},0 L${width},${height/2} L${width-12},${height} L0,${height} Z`} fill="none" stroke="#444" strokeWidth="1" />
    </svg>
  );
}

export function COLREGPanel() {
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rules' | 'lights' | 'sounds' | 'flags'>('rules');

  const toggleRule = (rule: string) => {
    setExpandedRule(expandedRule === rule ? null : rule);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <BookOpen className="w-12 h-12 mx-auto text-[#00eaff] mb-2" />
        <h2 className="text-xl font-bold text-[#00eaff]">COLREG Reference</h2>
        <p className="text-sm text-[#7feaff]">International Regulations for Preventing Collisions at Sea</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeTab === 'rules' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('rules')}
          className={activeTab === 'rules' ? 'bg-[#00eaff] text-black' : 'border-[#00eaff33] text-[#7feaff]'}
        >
          <Navigation className="w-4 h-4 mr-1" />
          Rules
        </Button>
        <Button
          variant={activeTab === 'lights' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('lights')}
          className={activeTab === 'lights' ? 'bg-[#00eaff] text-black' : 'border-[#00eaff33] text-[#7feaff]'}
        >
          <BookOpen className="w-4 h-4 mr-1" />
          Lights
        </Button>
        <Button
          variant={activeTab === 'sounds' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('sounds')}
          className={activeTab === 'sounds' ? 'bg-[#00eaff] text-black' : 'border-[#00eaff33] text-[#7feaff]'}
        >
          <AlertTriangle className="w-4 h-4 mr-1" />
          Sounds
        </Button>
        <Button
          variant={activeTab === 'flags' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('flags')}
          className={activeTab === 'flags' ? 'bg-[#00eaff] text-black' : 'border-[#00eaff33] text-[#7feaff]'}
        >
          <Flag className="w-4 h-4 mr-1" />
          Signal Flags
        </Button>
      </div>

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {colregRules.map((item) => (
            <div 
              key={item.rule}
              className="border border-[#00eaff33] rounded-xl overflow-hidden bg-[#021019]"
            >
              <button
                onClick={() => toggleRule(item.rule)}
                className="w-full p-3 flex items-center justify-between text-left hover:bg-[#0a2a3a] transition-colors"
              >
                <div>
                  <span className="font-bold text-[#00eaff]">{item.rule}</span>
                  <span className="ml-2 text-[#7feaff]">{item.title}</span>
                </div>
                {expandedRule === item.rule ? (
                  <ChevronUp className="w-4 h-4 text-[#7feaff]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#7feaff]" />
                )}
              </button>
              {expandedRule === item.rule && (
                <div className="p-3 bg-[#000c14] border-t border-[#00eaff33]">
                  <p className="text-sm text-[#9fe9ff] mb-2">{item.description}</p>
                  {item.action && (
                    <div className="p-2 bg-[#00eaff22] border border-[#00eaff33] rounded-lg">
                      <span className="text-xs text-[#00eaff] font-medium">Action: </span>
                      <span className="text-xs text-[#7feaff]">{item.action}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lights Tab */}
      {activeTab === 'lights' && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {/* Legend */}
          <div className="p-2 bg-[#021019] border border-[#00eaff33] rounded-lg text-xs">
            <div className="text-[#7feaff] mb-2">Legend:</div>
            <div className="grid grid-cols-4 gap-2">
              <span className="flex items-center gap-1"><LightWhite/> White</span>
              <span className="flex items-center gap-1"><LightRed/> Red</span>
              <span className="flex items-center gap-1"><LightGreen/> Green</span>
              <span className="flex items-center gap-1"><LightYellow/> Yellow</span>
              <span className="flex items-center gap-1"><ShapeBall/> Ball</span>
              <span className="flex items-center gap-1"><ShapeCone/> Cone</span>
              <span className="flex items-center gap-1"><ShapeCylinder/> Cylinder</span>
              <span className="flex items-center gap-1"><ShapeDiamond/> Diamond</span>
            </div>
            <div className="mt-2 text-[10px] text-[#9fe9ff]">
              <LightStack><LightRed/><LightRed/></LightStack> = Vertical stack (top to bottom)
            </div>
          </div>
          {lightPatterns.map((item, index) => (
            <div key={index} className="p-3 bg-[#021019] border border-[#00eaff33] rounded-xl">
              <div className="font-medium text-[#7fd3ff] mb-1">{item.name}</div>
              <div className="text-xs text-[#ffaa00] flex items-center gap-1 flex-wrap">Lights: {item.lights}</div>
              <div className="text-xs text-[#00ff88] mt-1 flex items-center gap-1 flex-wrap">Shapes: {item.shapes}</div>
            </div>
          ))}
        </div>
      )}

      {/* Sounds Tab */}
      {activeTab === 'sounds' && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {soundSignals.map((item, index) => (
            <div key={index} className="p-3 bg-[#021019] border border-[#00eaff33] rounded-xl">
              <div className="font-medium text-[#7fd3ff]">{item.situation}</div>
              <div className="text-xs text-[#ffaa00] mt-1">{item.signal}</div>
            </div>
          ))}
        </div>
      )}

      {/* Signal Flags Tab */}
      {activeTab === 'flags' && (
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {/* Letter Flags with Visual */}
          <div>
            <h3 className="text-sm font-bold text-[#00eaff] mb-3">International Code of Signals - Letter Flags</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {letterFlags.map((flag) => (
                <div key={flag.letter} className="p-2 bg-[#021019] border border-[#00eaff33] rounded-lg flex items-center gap-3">
                  <FlagSVG flag={flag} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-[#00eaff] text-sm">{flag.letter}</span>
                      <span className="text-[#7feaff] text-xs font-medium">{flag.name}</span>
                    </div>
                    <div className="text-[10px] text-[#9fe9ff] leading-tight">{flag.meaning}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Number Pennants */}
          <div>
            <h3 className="text-sm font-bold text-[#00eaff] mb-3">Number Pennants</h3>
            <div className="grid grid-cols-5 gap-2">
              {numberPennants.map((pennant) => (
                <div key={pennant.number} className="p-2 bg-[#021019] border border-[#00eaff33] rounded-lg text-center">
                  <PennantSVG colors={pennant.colors} />
                  <div className="font-bold text-[#00eaff] text-lg mt-1">{pennant.number}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Signals */}
          <div className="p-3 bg-[#021019] border border-[#00eaff33] rounded-xl">
            <h3 className="text-sm font-bold text-[#00eaff] mb-2">Common Signal Combinations</h3>
            <div className="space-y-1 text-xs text-[#9fe9ff]">
              <div><span className="text-[#00eaff] font-bold">AC:</span> I am abandoning my vessel</div>
              <div><span className="text-[#00eaff] font-bold">AN:</span> I need a doctor</div>
              <div><span className="text-[#00eaff] font-bold">BR:</span> I require a helicopter</div>
              <div><span className="text-[#00eaff] font-bold">CB:</span> I require immediate assistance</div>
              <div><span className="text-[#00eaff] font-bold">DX:</span> I am sinking</div>
              <div><span className="text-[#00eaff] font-bold">EF:</span> I have sunk; rescue survivors</div>
              <div><span className="text-[#00eaff] font-bold">FA:</span> Will you give me my position?</div>
              <div><span className="text-[#00eaff] font-bold">GN:</span> I require a tug</div>
              <div><span className="text-[#00eaff] font-bold">IT:</span> I am on fire</div>
              <div><span className="text-[#00eaff] font-bold">LO:</span> I am not under command</div>
              <div><span className="text-[#00eaff] font-bold">NC:</span> I am in distress and require immediate assistance</div>
              <div><span className="text-[#00eaff] font-bold">PD:</span> Your navigation lights are not visible</div>
              <div><span className="text-[#00eaff] font-bold">RU:</span> Keep clear of me; I am engaged in submarine survey work</div>
              <div><span className="text-[#00eaff] font-bold">YT:</span> I am going to communicate with your station by means of the International Code of Signals</div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-[#021019] border border-[#ffaa0033] rounded-xl">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[#ffaa00] mt-0.5" />
          <div className="text-xs text-[#7feaff]">
            <strong className="text-[#ffaa00]">Disclaimer:</strong> This is a quick reference only. 
            Always refer to the official International Regulations for Preventing Collisions at Sea 
            (COLREGs) for complete and authoritative information.
          </div>
        </div>
      </div>
    </div>
  );
}
