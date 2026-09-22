"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Save,
  RotateCcw,
  Type,
  Code2,
  Eye,
  Check,
  AlignLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlideRenderer } from "@/components/editor/SlideRenderer";
import type { AspectRatio } from "@/types/carousel";

interface QuickEditSlideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slideId: string;
  initialHtml: string;
  slideIndex: number;
  aspectRatio: AspectRatio;
  onSave: (slideId: string, updatedHtml: string) => Promise<void>;
}

interface ExtractedTextItem {
  id: string;
  selector: string;
  index: number;
  tag: string;
  label: string;
  text: string;
}

export function QuickEditSlideModal({
  open,
  onOpenChange,
  slideId,
  initialHtml,
  slideIndex,
  aspectRatio,
  onSave,
}: QuickEditSlideModalProps) {
  const [activeTab, setActiveTab] = useState<"fields" | "html">("fields");
  const [currentHtml, setCurrentHtml] = useState(initialHtml);
  const [textFields, setTextFields] = useState<ExtractedTextItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Extract editable text elements from slide HTML
  const parseHtmlFields = useCallback((htmlString: string) => {
    if (typeof window === "undefined") return [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");
      const items: ExtractedTextItem[] = [];

      // Query elements typically carrying visible content
      const elements = doc.body.querySelectorAll("h1, h2, h3, h4, p, span, li, pre, code, blockquote");

      let count = 0;
      elements.forEach((el, idx) => {
        // Skip elements that contain other block elements or are purely structural
        const hasChildBlock = el.querySelector("h1, h2, h3, h4, p, pre, ul, ol");
        if (hasChildBlock) return;

        const text = el.textContent?.trim() || "";
        if (!text) return;

        // Skip SVG text or tiny icons
        if (el.closest("svg")) return;

        const tagName = el.tagName.toLowerCase();
        let label = "Texte";
        if (tagName === "h1") label = "Titre principal";
        else if (tagName === "h2") label = "Sous-titre";
        else if (tagName === "h3") label = "En-tête";
        else if (tagName === "pre" || tagName === "code") label = "Code / Script";
        else if (tagName === "li") label = "Élément de liste";
        else if (el.classList.contains("badge") || el.classList.contains("tag")) label = "Badge";

        items.push({
          id: `item-${idx}-${count++}`,
          selector: tagName,
          index: idx,
          tag: tagName,
          label,
          text: el.innerHTML.trim(),
        });
      });

      return items;
    } catch {
      return [];
    }
  }, []);

  // When modal opens or slide changes, reset fields and HTML
  useEffect(() => {
    if (open) {
      setCurrentHtml(initialHtml);
      setTextFields(parseHtmlFields(initialHtml));
      setSavedSuccess(false);
    }
  }, [open, initialHtml, parseHtmlFields]);

  // Update HTML when a text field changes
  const handleFieldChange = (fieldId: string, newText: string) => {
    setTextFields((prev) =>
      prev.map((item) => (item.id === fieldId ? { ...item, text: newText } : item))
    );

    // Reconstruct HTML by applying modified field values
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(initialHtml, "text/html");
      const elements = doc.body.querySelectorAll("h1, h2, h3, h4, p, span, li, pre, code, blockquote");

      // Build map of modified fields
      const updatedMap = new Map(
        textFields.map((item) => [
          item.id === fieldId ? item.index : item.index,
          item.id === fieldId ? newText : item.text,
        ])
      );

      elements.forEach((el, idx) => {
        if (updatedMap.has(idx)) {
          el.innerHTML = updatedMap.get(idx)!;
        }
      });

      setCurrentHtml(doc.body.innerHTML);
    } catch {
      // ignore parsing error
    }
  };

  const handleReset = () => {
    setCurrentHtml(initialHtml);
    setTextFields(parseHtmlFields(initialHtml));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(slideId, currentHtml);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onOpenChange(false);
      }, 700);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm oc-fade">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Type className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <span>Édition Rapide — Slide {slideIndex + 1}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-mono">
                  {aspectRatio}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Modifiez directement vos textes ou votre code sans passer par le chat IA.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex items-center bg-muted/50 p-0.5 rounded-lg border border-border">
              <button
                onClick={() => setActiveTab("fields")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === "fields"
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <AlignLeft className="h-3.5 w-3.5" />
                <span>Champs de texte</span>
              </button>
              <button
                onClick={() => setActiveTab("html")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === "html"
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Code HTML</span>
              </button>
            </div>

            <button
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content: 2-Column Split View (Editor Left, Live Preview Right) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left Column: Editor Controls */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-border flex flex-col">
            {activeTab === "fields" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Éléments détectés ({textFields.length})
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Modifiez le contenu ci-dessous
                  </span>
                </div>

                {textFields.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Type className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Aucun champ de texte distinct détecté.</p>
                    <p className="text-xs mt-1">
                      Passez à l&apos;onglet <strong>Code HTML</strong> pour modifier la slide directement.
                    </p>
                  </div>
                ) : (
                  textFields.map((field) => {
                    const isMultiline =
                      field.tag === "pre" ||
                      field.tag === "code" ||
                      field.text.length > 80 ||
                      field.text.includes("\n");

                    return (
                      <div key={field.id} className="space-y-1.5">
                        <label className="text-xs font-medium flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1.5 text-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                            {field.label}
                          </span>
                          <span className="font-mono text-[10px] uppercase bg-muted/60 px-1.5 py-0.5 rounded">
                            &lt;{field.tag}&gt;
                          </span>
                        </label>

                        {isMultiline ? (
                          <textarea
                            value={field.text}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            rows={field.tag === "pre" || field.tag === "code" ? 4 : 3}
                            className="w-full text-xs font-mono p-2.5 rounded-lg border border-border bg-muted/20 focus:border-accent focus:outline-none resize-y transition-colors leading-relaxed"
                          />
                        ) : (
                          <input
                            type="text"
                            value={field.text}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            className="w-full text-xs p-2.5 rounded-lg border border-border bg-muted/20 focus:border-accent focus:outline-none transition-colors"
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-border/60">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    HTML de la slide
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Modifications directes en temps réel
                  </span>
                </div>
                <textarea
                  value={currentHtml}
                  onChange={(e) => setCurrentHtml(e.target.value)}
                  className="flex-1 w-full p-3 rounded-lg border border-border bg-muted/30 font-mono text-xs text-foreground focus:border-accent focus:outline-none resize-none leading-relaxed"
                  spellCheck={false}
                />
              </div>
            )}
          </div>

          {/* Right Column: Real-time Live Preview */}
          <div className="w-full md:w-[420px] bg-background/50 p-6 flex flex-col items-center justify-center shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 self-start">
              <Eye className="h-3.5 w-3.5 text-accent" />
              <span>Aperçu instantané</span>
            </div>

            <div className="w-full max-w-[340px] aspect-auto max-h-[500px] flex items-center justify-center rounded-xl overflow-hidden border border-border/80 shadow-2xl bg-surface">
              <SlideRenderer
                html={currentHtml}
                aspectRatio={aspectRatio}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Réinitialiser</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Annuler
            </Button>
            <Button
              variant="accent"
              size="sm"
              disabled={isSaving}
              onClick={handleSave}
              className="text-xs gap-1.5 font-medium shadow-sm min-w-[120px]"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Enregistré !</span>
                </>
              ) : isSaving ? (
                <span>Sauvegarde...</span>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Enregistrer</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
