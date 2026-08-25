import React, { useState } from 'react';
import { X, Copy, Check, Share2, Radio, Send, MessageSquare } from 'lucide-react';
import { FloodRiskResult, LocationProfile } from '../types';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: FloodRiskResult;
  location: LocationProfile;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  result,
  location,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'STANDARD' | 'NEPALI' | 'SMS_SHORT'>('STANDARD');

  if (!isOpen) return null;

  const { riskLevel, riskScore, reason, recommendedActions } = result;

  // Standard official alert matching required format
  const standardAlertText = `🚨 ${riskLevel} FLOOD RISK
Area: ${location.name}
Predicted risk: ${riskScore}%
Reason: ${reason}

Key Actions:
${recommendedActions.slice(0, 3).map((a) => `• ${a}`).join('\n')}

Emergency Hotlines:
• DHM Flood Toll-Free: 1155
• Nepal Police: 100
• Disaster Center (NEOC): 1149
Timestamp: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' })} NPT`;

  // Nepali localized broadcast text
  const nepaliAlertText = `🚨 ${result.nepaliSummary.riskLevel} बाढी जोखिम पूर्व चेतावनी
स्थान: ${location.nameNepali}
अनुमानित जोखिम: ${riskScore}%
कारण: ${result.nepaliSummary.reason}

तत्काल गर्नुपर्ने कार्यहरू:
• सुरक्षित उच्च स्थान वा पक्की भवनमा स्थानान्तरण हुनुहोस्।
• महत्वपूर्ण कागजात र आपतकालीन झोला साथमा राख्नुहोस्।
• नदी किनारका सडक तथा करिडोरबाट टाढा रहनुहोस्।

आपतकालीन सम्पर्क नम्बरहरू:
• जल तथा मौसम विज्ञान विभाग टोल-फ्री: ११५५
• नेपाल प्रहरी: १००
• राष्ट्रिय आपतकालीन कार्यसञ्चालन केन्द्र: ११४९`;

  // Compact SMS alert (< 160 characters)
  const smsShortText = `🚨 [${riskLevel} FLOOD ALERT] Area: ${location.name} | Risk: ${riskScore}% | ${reason.slice(0, 70)} | Call DHM 1155 / Police 100`;

  const getActiveText = () => {
    if (activeTab === 'NEPALI') return nepaliAlertText;
    if (activeTab === 'SMS_SHORT') return smsShortText;
    return standardAlertText;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getActiveText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(getActiveText())}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-400" />
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-slate-200">
              BROADCAST EARLY WARNING DISPATCH (CAP/SMS)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex bg-slate-950 p-1.5 border-b border-slate-700 gap-1 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('STANDARD')}
            className={`flex-1 py-1.5 rounded text-[10px] uppercase font-bold transition-all cursor-pointer ${
              activeTab === 'STANDARD'
                ? 'bg-slate-800 text-cyan-300 border border-slate-600 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            STANDARD ENGLISH
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('NEPALI')}
            className={`flex-1 py-1.5 rounded text-[10px] uppercase font-bold transition-all cursor-pointer ${
              activeTab === 'NEPALI'
                ? 'bg-slate-800 text-cyan-300 border border-slate-600 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            नेपाली सूचना (NEPALI)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SMS_SHORT')}
            className={`flex-1 py-1.5 rounded text-[10px] uppercase font-bold transition-all cursor-pointer ${
              activeTab === 'SMS_SHORT'
                ? 'bg-slate-800 text-cyan-300 border border-slate-600 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SMS / RADIO SHORT
          </button>
        </div>

        {/* Text Area Content */}
        <div className="p-4 space-y-3 overflow-y-auto">
          <div className="relative">
            <textarea
              readOnly
              rows={11}
              value={getActiveText()}
              className="w-full bg-slate-950 text-slate-200 font-mono text-xs p-3.5 rounded border border-slate-700 focus:outline-none resize-none leading-relaxed selection:bg-cyan-500 selection:text-slate-950"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-mono font-bold uppercase border border-slate-600 flex items-center gap-1.5 shadow cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'COPIED' : 'COPY'}
            </button>
          </div>

          <p className="text-[10px] text-slate-400 font-mono uppercase">
            FORMATTED FOR INSTANT BROADCAST TO NEPAL POLICE DISPATCH, DHM 1155 PORTAL, & WARD DISASTER UNITS.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-700 flex items-center justify-between gap-2.5 font-mono">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 py-2 px-3 rounded text-[10px] uppercase font-bold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            SHARE VIA WHATSAPP
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-2 px-3 rounded text-[10px] uppercase font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'COPIED TO CLIPBOARD' : 'COPY ALL TEXT'}
          </button>
        </div>
      </div>
    </div>
  );
};
