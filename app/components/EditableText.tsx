"use client";
import { useState, useRef, useEffect } from "react";

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
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored !== null) setValue(stored);
  }, [key]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    const next = value.trim() || initialValue;
    setValue(next);
    localStorage.setItem(key, next);
    setEditing(false);
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
    };

    return multiline
      ? <textarea {...sharedProps} rows={3} style={{ resize: "vertical" }} />
      : <input {...sharedProps} type="text" />;
  }

  return (
    <Tag
      className={`${className} cursor-pointer rounded hover:outline hover:outline-2 hover:outline-blue-300 hover:outline-offset-2 transition-all`}
      title="Click to edit"
      onClick={() => setEditing(true)}
    >
      {value}
    </Tag>
  );
}
