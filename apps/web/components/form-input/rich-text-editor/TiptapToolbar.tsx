import React, { useEffect, useState, useCallback } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import { ToolbarButton } from "./ToolbarButton";

const COLORS = [
  "#000000",
  "#FF0000",
  "#0000FF",
  "#008000",
  "#FFA500",
  "#800080",
];

const FONT_SIZES = ["12", "14", "16", "18", "24", "32"];

const TEXT_STYLES = [
  { label: "Normal", value: "paragraph" },
  { label: "Heading 1", value: "heading1" },
  { label: "Heading 2", value: "heading2" },
  { label: "Heading 3", value: "heading3" },
];

interface TiptapToolbarProps {
  editor: Editor | null;
}

export function TiptapToolbar({ editor }: TiptapToolbarProps) {
  const [openDropdown, setOpenDropdown] = useState<null | 'fontSize' | 'textStyle' | 'color'>(null);
  const [currentFontSize, setCurrentFontSize] = useState("14");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

   const updateDropdownPosition = useCallback((dropdownType: 'fontSize' | 'textStyle' | 'color') => {
    const triggerElement = document.querySelector(`[data-dropdown-trigger="${dropdownType}"]`) as HTMLElement;
    if (triggerElement) {
      const rect = triggerElement.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 5,
        left: rect.left
      });
    }
  }, []);

   useEffect(() => {
    if (!openDropdown) return;

    const handleScroll = () => {
      updateDropdownPosition(openDropdown);
    };

     const editorElement = editor?.view.dom.closest('.ProseMirror')?.parentElement;
    if (editorElement) {
      editorElement.addEventListener('scroll', handleScroll);
    }
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      if (editorElement) {
        editorElement.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [openDropdown, updateDropdownPosition, editor]);

  useEffect(() => {
    if (!editor) return;

    const updateFontSize = () => {
      const { fontSize } = editor.getAttributes('textStyle');
      if (fontSize) {
        const size = fontSize.replace('px', '');
        setCurrentFontSize(size);
      } else {
        setCurrentFontSize("14"); 
      }
    };

    editor.on('selectionUpdate', updateFontSize);
    editor.on('update', updateFontSize);

    return () => {
      editor.off('selectionUpdate', updateFontSize);
      editor.off('update', updateFontSize);
    };
  }, [editor]);

   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.tiptap-toolbar')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  if (!editor) return null;

  const setTextStyle = (style: string) => {
    console.log('Setting text style:', style);
    const chain = editor.chain().focus();
    if (style === "paragraph") {
      chain.setParagraph().run();
    } else if (style.startsWith("heading")) {
      const level = parseInt(style.replace("heading", "")) as 1 | 2 | 3;
      chain.setHeading({ level }).run();
    }
  };

  const setFontSize = (size: string) => {
    console.log('Setting font size:', size);
    editor.chain().focus().setMark('textStyle', { 
      fontSize: `${size}px`
    }).run();
    setCurrentFontSize(size);
  };

  const handleDropdownToggle = (dropdownType: 'fontSize' | 'textStyle' | 'color') => {
    if (openDropdown === dropdownType) {
      setOpenDropdown(null);
    } else {
       updateDropdownPosition(dropdownType);
      setOpenDropdown(dropdownType);
    }
  };

  const renderDropdown = (dropdownType: 'fontSize' | 'textStyle' | 'color') => {
    if (openDropdown !== dropdownType) return null;

    const dropdownStyles = {
      top: `${dropdownPosition.top}px`,
      left: `${dropdownPosition.left}px`,
      transform: 'translateZ(0)'  
    };

    switch (dropdownType) {
      case 'fontSize':
        return (
          <div 
            className="fixed p-2 bg-white rounded shadow-lg border z-[9999] flex flex-col gap-1 min-w-[60px] sm:min-w-[80px]" 
            style={dropdownStyles}
          >
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                className="text-xs py-1 px-2 hover:bg-gray-100 rounded w-full text-left cursor-pointer transition-colors"
                onClick={() => {
                  setFontSize(size);
                  setOpenDropdown(null);
                }}
              >
                {size}
              </button>
            ))}
          </div>
        );

      case 'textStyle':
        return (
          <div 
            className="fixed p-2 bg-white rounded shadow-lg border z-[9999] flex flex-col gap-1 min-w-[100px] sm:min-w-[120px]" 
            style={dropdownStyles}
          >
            {TEXT_STYLES.map((style) => (
              <button
                key={style.value}
                type="button"
                className="text-xs py-1 px-2 hover:bg-gray-100 rounded w-full text-left cursor-pointer transition-colors"
                onClick={() => {
                  setTextStyle(style.value);
                  setOpenDropdown(null);
                }}
              >
                {style.label}
              </button>
            ))}
          </div>
        );

      case 'color':
        return (
          <div 
            className="fixed p-2 bg-white rounded shadow-lg border z-[9999] flex gap-1 flex-wrap max-w-[120px] sm:max-w-[140px]" 
            style={dropdownStyles}
          >
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className="w-5 h-5 sm:w-6 sm:h-6 rounded border border-gray-200 hover:border-gray-400 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => {
                  console.log('Setting color:', color);
                  editor.chain().focus().setColor(color).run();
                  setOpenDropdown(null);
                }}
                title={color}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="tiptap-toolbar relative z-10 flex items-center w-full px-2 sm:px-3 py-1 bg-[#F0F1F2] flex-nowrap space-x-0.5 sm:space-x-1 overflow-x-auto overflow-y-visible">
       <div className="relative">
        <ToolbarButton
          onClick={() => handleDropdownToggle('fontSize')}
          isActive={false}
          title="Font Size"
        >
          <div data-dropdown-trigger="fontSize">
            <span className="text-xs font-medium hidden sm:inline">{currentFontSize}</span>
            <span className="text-xs font-medium sm:hidden">FS</span>
          </div>
        </ToolbarButton>
        {renderDropdown('fontSize')}
      </div>

       <div className="relative">
        <ToolbarButton
          onClick={() => handleDropdownToggle('textStyle')}
          isActive={false}
          title="Text Style"
        >
          <div data-dropdown-trigger="textStyle">
            <span className="text-sm font-bold">T</span>
          </div>
        </ToolbarButton>
        {renderDropdown('textStyle')}
      </div>

      {/* Color Picker */}
      <div className="relative">
        <ToolbarButton
          onClick={() => handleDropdownToggle('color')}
          isActive={false}
          title="Text Color"
        >
          <div data-dropdown-trigger="color">
            <div
              className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-gray-300"
              style={{
                backgroundColor: editor.getAttributes("textStyle").color || "#000",
              }}
            />
          </div>
        </ToolbarButton>
        {renderDropdown('color')}
      </div>

       <div className="w-px h-6 bg-gray-300 mx-1 sm:mx-2"></div>

       <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold"
      >
        <Bold className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic"
      >
        <Italic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Underline"
      >
        <UnderlineIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strike"
      >
        <Strikethrough className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="Align Left"
      >
        <AlignLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="Align Center"
      >
        <AlignCenter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="Align Right"
      >
        <AlignRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </ToolbarButton>

       <div className="w-px h-6 bg-gray-300 mx-1 sm:mx-2"></div>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Ordered List"
      >
        <ListOrdered className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </ToolbarButton>

       <div className="w-px h-6 bg-gray-300 mx-1 sm:mx-2"></div>

       <ToolbarButton
        onClick={() => {
          const url = window.prompt("Enter image URL");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}
        title="Insert Image"
      >
        <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </ToolbarButton>

       <ToolbarButton
        onClick={() => {
          const url = window.prompt("Enter URL");
          if (url) {
            const formattedUrl = url.startsWith("http")
              ? url
              : `https://${url}`;
            editor.chain().focus().setLink({ href: formattedUrl }).run();
          }
        }}
        isActive={editor.isActive("link")}
        title="Insert Link"
      >
        <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </ToolbarButton>
    </div>
  );
}