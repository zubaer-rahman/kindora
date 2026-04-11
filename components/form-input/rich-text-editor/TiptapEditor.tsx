import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import { FontSize } from "./FontSize";
import { TiptapToolbar } from "./TiptapToolbar";

interface TiptapEditorProps<T extends FieldValues> {
  field: ControllerRenderProps<T, Path<T>>;
  placeholder?: string;
}

export function TiptapEditor<T extends FieldValues>({
  field,
  placeholder,
}: TiptapEditorProps<T>) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: { class: "list-disc pl-4" },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: { class: "list-decimal pl-4" },
        },
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: { class: "font-bold" },
        },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      FontSize,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: { class: "max-w-full rounded" },
      }),
    ],
    content: field.value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (field.value !== html) field.onChange(html);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm focus:outline-none p-4",
        ...(placeholder ? { "data-placeholder": placeholder } : {}),
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && field.value !== editor.getHTML()) {
      editor.commands.setContent(field.value || "");
    }
  }, [field.value, editor]);

  if (!editor) {
    return (
      <div className="h-[200px] bg-white border border-gray-300 rounded-md p-2" />
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
      <TiptapToolbar editor={editor} />
      <div className="relative z-0" style={{ overflow: "visible" }}>
        <div className="h-[200px] overflow-y-auto">
          <EditorContent
            editor={editor}
            className="h-full"
            style={{ overflow: "visible" }}
          />
        </div>
        <style>{`
          .ProseMirror {
            outline: none;
            min-height: 100%;
          }
          .ProseMirror p {
            margin: 0.5em 0;
          }
          .ProseMirror h1 {
            font-size: 2em;
            margin: 0.5em 0;
            font-weight: bold;
          }
          .ProseMirror h2 {
            font-size: 1.5em;
            margin: 0.5em 0;
            font-weight: bold;
          }
          .ProseMirror h3 {
            font-size: 1.17em;
            margin: 0.5em 0;
            font-weight: bold;
          }
          .ProseMirror ul {
            list-style-type: disc;
            padding-left: 1.5em;
            margin: 0.5em 0;
          }
          .ProseMirror ol {
            list-style-type: decimal;
            padding-left: 1.5em;
            margin: 0.5em 0;
          }
          .ProseMirror img {
            display: block;
            max-width: 100%;
            height: auto;
            margin: 0.5em 0;
            border-radius: 0.5em;
          }
          .ProseMirror a {
            color: #2563eb;
            text-decoration: underline;
            cursor: pointer;
            word-break: break-word;
          }
          .ProseMirror .ProseMirror-selectednode {
            outline: 2px solid #2563eb;
          }
          .ProseMirror [style*="font-size"] {
            line-height: 1.2;
          }
          .ProseMirror [style*="color"] {
            display: inline;
          }
        `}</style>
      </div>
    </div>
  );
}
