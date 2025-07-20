import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

interface MarkdownEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  preview?: "edit" | "live" | "preview";
}

export function MarkdownEditor({
  value = "",
  onChange,
  placeholder = "Write your notes in Markdown...",
  height = 200,
  preview = "live",
}: MarkdownEditorProps) {
  const [editorValue, setEditorValue] = useState(value);

  const handleChange = (val?: string) => {
    const newValue = val || "";
    setEditorValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="markdown-editor-container">
      <MDEditor
        value={editorValue}
        onChange={handleChange}
        preview={preview}
        height={height}
        data-color-mode="light" // You can make this dynamic based on theme
        hideToolbar={false}
        visibleDragbar={false}
        textareaProps={{
          placeholder: placeholder,
          style: {
            fontSize: 13,
            lineHeight: 1.5,
            fontFamily:
              '"SF Mono", Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace',
          },
        }}
      />
    </div>
  );
}

export default MarkdownEditor;
