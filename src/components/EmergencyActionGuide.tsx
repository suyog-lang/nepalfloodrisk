import React from 'react';
import {
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  LifeBuoy,
  Users,
  ExternalLink,
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
  const { riskLevel, recommendedActions } = result;

  const hotlines = [
    {
      title: 'DHM Flood Alert (जल तथा मौसम विज्ञान विभाग)',
      number: '1155',
      desc: 'Toll-free 24/7 river bulletin & flood early warning',
      color: 'bg-cyan-950/80 border-cyan-700 text-cyan-300',
    },
    {
      title: 'Nepal Police Control (नेपाल प्रहरी)',
      number: '100',
      desc: 'Emergency rescue, control & public safety',
      color: 'bg-blue-950/80 border-blue-700 text-blue-300',
    },
    {
      title: 'Disaster Response NEOC (राष्ट्रिय आपतकालीन कार्यसञ्चालन केन्द्र)',
      number: '1149',
      desc: 'Ministry of Home Affairs disaster helpline',
      color: 'bg-amber-950/80 border-amber-700 text-amber-300',
    },
    {
      title: 'Ambulance & Medical (एम्बुलेन्स सेवा)',
      number: '102',
      desc: 'Immediate emergency medical and ambulance dispatch',
      color: 'bg-rose-950/80 border-rose-700 text-rose-300',
    },
    {
      title: 'Armed Police Force Water Rescue (सशस्त्र प्रहरी बल)',
      number: '1114',
      desc: 'Raft boat and rapid river search & rescue',
      color: 'bg-indigo-950/80 border-indigo-700 text-indigo-300',
    },
  ];

  return (
    <section id="emergency-actions-section" className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            {language === 'NE' ? 'आपतकालीन कार्य र सुरक्षा निर्देशन' : 'Emergency Action Checklist & Response Guide'}
          </h3>
          <p className="text-xs text-slate-400">
            {language === 'NE' ? `${location.name} को लागि सुरक्षा उपायहरू` : `Safety measures for ${location.name} (${riskLevel} risk level)`}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
            riskLevel === 'SEVERE' || riskLevel === 'HIGH'
              ? 'bg-red-950 text-red-300 border-red-600 animate-pulse'
              : riskLevel === 'MODERATE'
              ? 'bg-amber-950 text-amber-300 border-amber-600'
              : 'bg-emerald-950 text-emerald-300 border-emerald-600'
          }`}
        >
          {riskLevel} PROTOCOL
        </span>
      </div>

      {/* Action Steps */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          {language === 'NE' ? 'तुरुन्त गर्नुपर्ने कामहरू' : 'Immediate Recommended Actions'}:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {recommendedActions.map((action, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                riskLevel === 'SEVERE' || riskLevel === 'HIGH'
                  ? 'bg-red-950/30 border-red-800/80 text-red-100'
                  : riskLevel === 'MODERATE'
                  ? 'bg-amber-950/30 border-amber-800/60 text-amber-100'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-cyan-900 text-cyan-200 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs md:text-sm leading-relaxed">{action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Vulnerable Settlements */}
      {location.vulnerableCommunities.length > 0 && (
        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'NE' ? 'जोखिमयुक्त नजिकका बस्तीहरू' : 'High-Risk Riverside Settlements in this Catchment'}:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {location.vulnerableCommunities.map((comm, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-700 text-xs"
              >
                📍 {comm}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Direct Emergency Call Hotlines */}
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
          <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
          {language === 'NE' ? 'नेपाल आपतकालीन हटलाइनहरू (१-ट्याप कल)' : 'Nepal Emergency Hotlines (1-Tap Call)'}:
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {hotlines.map((item, idx) => (
            <a
              key={idx}
              href={`tel:${item.number}`}
              className={`p-3 rounded-lg border flex items-center justify-between gap-3 hover:brightness-125 transition-all shadow-sm ${item.color}`}
            >
              <div className="space-y-0.5">
                <span className="text-xs font-bold block">{item.title}</span>
                <span className="text-[10px] text-slate-400 block">{item.desc}</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-md border border-slate-700 shrink-0">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-white">{item.number}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
