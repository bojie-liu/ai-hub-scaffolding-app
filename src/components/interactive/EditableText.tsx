"use client";
import { useState, useRef, useEffect } from "react";
import { saveEditableContent, getEditableContent } from "@/lib/actions/editable-content";
import { linkify } from "@/lib/linkify";

interface EditableTextProps {
  initialValue: string;
  storageKey?: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  multiline?: boolean;
}

export default function EditableText({
  initialValue,
  storageKey,
  as: Tag = "span",
  className = "",
  multiline = false,
}: EditableTextProps) {
  const key = storageKey ?? `editable:${initialValue}`;

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    // Load from localStorage as cache, then update from database
    async function loadContent() {
      // Start with localStorage cache
      const cached = localStorage.getItem(key);
      if (cached !== null) {
        setValue(cached);
      }

      // Fetch from database and update both cache and state
      try {
        const dbContent = await getEditableContent(key);
        if (dbContent !== null) {
          localStorage.setItem(key, dbContent); // Update cache
          setValue(dbContent); // Update React state
        } else if (cached === null) {
          setValue(initialValue);
        }
      } catch (error) {
        console.error("Failed to load from database:", error);
        // Keep cached value or initial value if fetch fails
      }
    }
    loadContent();
  }, [key, initialValue]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  async function commit() {
    const next = value.trim() || initialValue;
    setValue(next);
    setEditing(false);

    // Save to both localStorage (cache) and database (permanent)
    localStorage.setItem(key, next);

    setIsLoading(true);
    try {
      await saveEditableContent(key, next);
    } catch (error) {
      console.error("Failed to save to database:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (editing) {
    const sharedProps = {
      ref: inputRef,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(e.target.value),
      onBlur: commit,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !multiline) { e.preventDefault(); commit(); }
        if (e.key === "Escape") { setValue(localStorage.getItem(key) ?? initialValue); setEditing(false); }
      },
      className: `${className} bg-white/80 border border-blue-400 rounded px-1 outline-none ring-2 ring-blue-300 w-full`,
      disabled: isLoading,
    };

    return multiline
      ? <textarea {...sharedProps} rows={3} style={{ resize: "vertical" }} />
      : <input {...sharedProps} type="text" />;
  }

  return (
    <Tag
      className={`${className} cursor-pointer rounded hover:outline hover:outline-2 hover:outline-blue-300 hover:outline-offset-2 transition-all ${isLoading ? 'opacity-50' : ''}`}
      title="點擊編輯"
      onClick={() => setEditing(true)}
    >
      {linkify(value)}
    </Tag>
  );
}
