import React, { useState } from "react";
import { Sparkles, Calendar, Target, Shield, Check, ChevronRight } from "lucide-react";

interface OnboardingProps {
  onComplete: (goals: string[]) => void;
  onLinkGoogle: () => void;
  isGoogleConnected: boolean;
}

export default function Onboarding({ onComplete, onLinkGoogle, isGoogleConnected }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const goalOptions = [
    { id: "focus", text: "Maximize deep-work focus hours" },
    { id: "burnout", text: "Prevent executive mental burnout" },
    { id: "delegate", text: "Automatically deconstruct goals into steps" },
    { id: "sync", text: "Sync real-time calendar agenda" },
  ];

  const handleToggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete(selectedGoals);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-2xl bg-neutral-950/80 select-none animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
      
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800/80 p-8 rounded-3xl shadow-2xl space-y-6 overflow-hidden">
        {/* Top decorative gradient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
          <span className="uppercase tracking-wider font-semibold">Momentum Setup</span>
          <span className="font-bold text-emerald-400">Step {step} of 3</span>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-display text-neutral-100">Welcome to Momentum AI</h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-sans">
                A clean, autonomous co-pilot designed to organize your focus, prevent burnout, and manage your daily strategy continuously.
              </p>
            </div>
            <div className="p-4 bg-neutral-950/40 border border-neutral-800/60 rounded-2xl flex items-start gap-3">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-400 leading-relaxed font-mono">
                Your data remains encrypted, stateless, and synchronized securely.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Goals */}
        {step === 2 && (
          <div className="space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-display text-neutral-100">What are your primary goals?</h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-sans">
                Select what you want Momentum AI to automate and keep track of for you.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {goalOptions.map((opt) => {
                const selected = selectedGoals.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleToggleGoal(opt.id)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                      selected
                        ? "bg-emerald-950/20 border-emerald-500 text-emerald-300 font-semibold"
                        : "bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <span>{opt.text}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selected ? "border-emerald-500 bg-emerald-500 text-white" : "border-neutral-700"}`}>
                      {selected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Calendar */}
        {step === 3 && (
          <div className="space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-display text-neutral-100">Connect Google Workspace</h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-sans">
                Link your Google Calendar to synchronize actual meetings, let AI block out high-focus slots, and receive strategic briefings.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              {isGoogleConnected ? (
                <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 rounded-2xl flex items-center justify-center gap-2 text-xs font-mono">
                  <Check className="w-4 h-4" />
                  <span>Google Workspace Account Connected</span>
                </div>
              ) : (
                <button
                  onClick={onLinkGoogle}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-100 text-neutral-800 font-bold text-xs py-3 px-4 rounded-xl shadow transition-all"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>Connect Google Calendar</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step dots */}
        <div className="flex gap-1.5 justify-center py-2">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`h-1.5 rounded-full transition-all duration-300 ${step === s ? "w-6 bg-emerald-500" : "w-1.5 bg-neutral-800"}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handleBack}
            className={`px-4 py-2.5 text-xs font-mono text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700 rounded-xl transition-all ${
              step === 1 ? "opacity-30 pointer-events-none" : ""
            }`}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 text-xs font-mono font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-1"
          >
            <span>{step === 3 ? "Get Started" : "Continue"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
