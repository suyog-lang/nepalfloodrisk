import React, { useState } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  CheckSquare,
  AlertTriangle,
  LifeBuoy,
  Building,
  HeartPulse,
  Flame,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FloodRiskLevel, FloodRiskResult, LocationProfile } from '../types';

interface EmergencyActionGuideProps {
  result: FloodRiskResult;
  location: LocationProfile;
  language: 'EN' | 'NE';
}

export const EmergencyActionGuide: React.FC<EmergencyActionGuideProps> = ({
  result,
  location,
  language,
}) => {
  const [showAllContacts, setShowAllContacts] = useState(false);
  const { riskLevel, recommendedActions, dangerThresholdExceeded } = result;

  const emergencyContacts = [
    {
      title: 'DHM Flood Early Warning Toll-Free',
      number: '1155',
      note: '24/7 River Level & Inundation Bulletin',
      priority: true,
      color: 'border-cyan-700/80 bg-slate-900 text-cyan-300',
    },
    {
      title: 'Nepal Police Emergency Control',
      number: '100',
      note: 'Search, Rescue & Emergency Dispatch',
      priority: true,
      color: 'border-blue-700/80 bg-slate-900 text-blue-300',
    },
    {
      title: 'National Emergency Operations Center (NEOC)',
      number: '1149',
      note: 'Ministry of Home Affairs Disaster Hotline',
      priority: true,
      color: 'border-amber-700/80 bg-slate-900 text-amber-300',
    },
    {
      title: 'Nepal Red Cross Society',
      number: '01-4270650',
      note: 'First Aid, Relief Supplies & Shelters',
      priority: false,
      color: 'border-red-700/80 bg-slate-900 text-red-300',
    },
    {
      title: 'Armed Police Force (APF) Disaster Unit',
      number: '1114',
      note: 'Water Rescue & Boat Deployment',
      priority: false,
      color: 'border-indigo-700/80 bg-slate-900 text-indigo-300',
    },
    {
      title: 'Kathmandu Metropolitan Emergency',
      number: '16600105511',
      note: 'Municipal Drainage & Road Clearance',
      priority: false,
      color: 'border-emerald-700/80 bg-slate-900 text-emerald-300',
    },
  ];

  return (
    <section id="emergency-actions-section" className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 md:p-5 shadow-xl space-y-5">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold font-mono">
              RECOMMENDED EMERGENCY ACTIONS & STANDARD OPERATING PROTOCOLS
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            Emergency advisory for <span className="text-slate-200 font-bold font-mono">{location.name.toUpperCase()}</span> based on active risk level ({riskLevel})
          </p>
        </div>

        <span
          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
            riskLevel === 'SEVERE' || riskLevel === 'HIGH'
              ? 'bg-red-950 text-red-300 border-red-600'
              : riskLevel === 'MODERATE'
              ? 'bg-amber-950 text-amber-300 border-amber-600'
              : 'bg-emerald-950 text-emerald-300 border-emerald-600'
          }`}
        >
          SOP PROTOCOL: LEVEL {riskLevel}
        </span>
      </div>

      {/* Action List */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
          MANDATORY ACTION CHECKLIST
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {recommendedActions.map((action, idx) => (
            <div
              key={idx}
              className={`p-3 rounded border flex items-start gap-3 transition-colors ${
                riskLevel === 'SEVERE' || riskLevel === 'HIGH'
                  ? 'bg-red-950/40 border-red-800/80 text-red-100'
                  : riskLevel === 'MODERATE'
                  ? 'bg-amber-950/30 border-amber-800/60 text-amber-100'
                  : 'bg-slate-900/80 border-slate-700/80 text-slate-300'
              }`}
            >
              <span className="w-5 h-5 rounded bg-slate-950 border border-slate-700 flex items-center justify-center text-[10px] font-mono font-bold text-cyan-400 shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs md:text-sm leading-relaxed font-sans">{action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contacts Directory */}
      <div className="pt-2 border-t border-slate-700 space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-red-400" />
            NEPAL DISASTER EMERGENCY HOTLINES
          </h4>
          <button
            type="button"
            onClick={() => setShowAllContacts(!showAllContacts)}
            className="text-[10px] font-mono uppercase text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            {showAllContacts ? 'SHOW LESS' : 'VIEW ALL HOTLINES'}
            {showAllContacts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {(showAllContacts ? emergencyContacts : emergencyContacts.slice(0, 3)).map((contact, idx) => (
            <div
              key={idx}
              className={`p-3 rounded border ${contact.color} flex flex-col justify-between gap-2 shadow-sm`}
            >
              <div>
                <span className="text-xs font-bold text-slate-200 block leading-tight">
                  {contact.title}
                </span>
                <span className="text-[10px] text-slate-400 font-sans">{contact.note}</span>
              </div>

              <div className="flex items-center justify-between pt-1.5 border-t border-slate-800">
                <a
                  href={`tel:${contact.number}`}
                  className="font-mono text-base font-black tracking-wider hover:underline flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  {contact.number}
                </a>
                <a
                  href={`tel:${contact.number}`}
                  className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-white border border-slate-600 hover:bg-slate-700"
                >
                  CALL NOW
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flood Preparedness Kit (Go-Bag) Box */}
      <div className="bg-slate-900/80 p-3.5 rounded border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <LifeBuoy className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-200 uppercase">
              ESSENTIAL FLOOD EVACUATION GO-BAG
            </h5>
            <p className="text-[11px] text-slate-400 font-sans">
              Waterproof pouch for Citizenship/NID, Torch + spare batteries, ORS / basic medicines, 3-day dry food, whistle.
            </p>
          </div>
        </div>

        <span className="text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded bg-slate-950 text-amber-300 border border-slate-700 whitespace-nowrap">
          KEEP AT EXIT
        </span>
      </div>
    </section>
  );
};
