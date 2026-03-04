"use client";
import { useState, useEffect } from "react";

interface ConceptCheckProps {
  title: string;
  prompt: string;
  storageKey: string;
}

export default function ConceptCheck({ title, prompt, storageKey }: ConceptCheckProps) {
  const [response, setResponse] = useState("");
  const [saved, setSaved] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [previousResponses, setPreviousResponses] = useState<{ response: string; timestamp: string }[]>([]);

  useEffect(() => {
    const user = localStorage.getItem("user:name");
    if (user) setIsLoggedIn(true);

    const stored = localStorage.getItem(`concept:${storageKey}`);
    if (stored) setPreviousResponses(JSON.parse(stored));
  }, [storageKey]);

  function handleSave() {
    if (!response.trim()) return;

    const newEntry = {
      response: response.trim(),
      timestamp: new Date().toLocaleString(),
    };

    const updated = [newEntry, ...previousResponses];
    setPreviousResponses(updated);
    localStorage.setItem(`concept:${storageKey}`, JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setResponse("");
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-amber-500 px-6 py-4">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <p className="text-amber-100 text-sm mt-1">{prompt}</p>
      </div>

      <div className="p-6">
        {isLoggedIn ? (
          <>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Type your response here..."
              rows={4}
              className="w-full text-sm border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={handleSave}
                disabled={!response.trim()}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Submit
              </button>
              {saved && (
                <span className="text-sm text-emerald-600 font-medium">Saved!</span>
              )}
            </div>

            {previousResponses.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Your Previous Responses</h4>
                <div className="space-y-3">
                  {previousResponses.map((r, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <p className="text-xs text-slate-500 mb-2">{r.timestamp}</p>
                      <p className="text-sm text-slate-700">{r.response}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-500 bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
            Please log in to submit your concept check.
          </p>
        )}
      </div>
    </div>
  );
}
