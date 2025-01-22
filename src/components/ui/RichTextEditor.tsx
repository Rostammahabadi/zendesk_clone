import { useState, useRef, useEffect } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, DraftHandleValue } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  clearContent?: boolean;
}

export function RichTextEditor({
  initialContent,
  onChange,
  placeholder = '',
  className = '',
  readOnly = false,
  onKeyPress,
  clearContent = false
}: RichTextEditorProps) {
  const editorRef = useRef<Editor>(null);
  const [editorState, setEditorState] = useState(() => {
    if (initialContent) {
      try {
        const content = JSON.parse(initialContent);
        return EditorState.createWithContent(convertFromRaw(content));
      } catch {
        return EditorState.createEmpty();
      }
    }
    return EditorState.createEmpty();
  });

  useEffect(() => {
    if (clearContent) {
      setEditorState(EditorState.createEmpty());
    }
  }, [clearContent]);

  const handleEditorChange = (newState: EditorState) => {
    setEditorState(newState);
    const content = JSON.stringify(convertToRaw(newState.getCurrentContent()));
    onChange(content);
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const handleKeyCommand = (command: string): DraftHandleValue => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      handleEditorChange(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const handleReturn = (e: React.KeyboardEvent): DraftHandleValue => {
    if (e.key === 'Enter' && !e.shiftKey && onKeyPress) {
      onKeyPress(e);
      return 'handled';
    }
    return 'not-handled';
  };

  const toggleInlineStyle = (e: React.MouseEvent, style: string) => {
    e.preventDefault();
    handleEditorChange(RichUtils.toggleInlineStyle(editorState, style));
    focusEditor();
  };

  const toggleBlockType = (e: React.MouseEvent, blockType: string) => {
    e.preventDefault();
    handleEditorChange(RichUtils.toggleBlockType(editorState, blockType));
    focusEditor();
  };

  const ToolbarButton = ({ onToggle, style, icon, label }: { onToggle: (e: React.MouseEvent) => void, style: string, icon: React.ReactNode, label: string }) => (
    <button
      type="button"
      onMouseDown={(e) => onToggle(e)}
      className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
        editorState.getCurrentInlineStyle().has(style) ? 'bg-gray-100 dark:bg-gray-700' : ''
      }`}
      title={label}
      aria-label={label}
      tabIndex={0}
    >
      {icon}
    </button>
  );

  return (
    <div className={`border rounded-lg overflow-hidden dark:border-gray-600 ${className}`}>
      {!readOnly && (
        <div className="flex items-center gap-1 p-2 border-b dark:border-gray-600" role="toolbar" aria-label="Text formatting options">
          <ToolbarButton
            onToggle={(e) => toggleInlineStyle(e, 'BOLD')}
            style="BOLD"
            icon={<Bold className="h-4 w-4" />}
            label="Bold"
          />
          <ToolbarButton
            onToggle={(e) => toggleInlineStyle(e, 'ITALIC')}
            style="ITALIC"
            icon={<Italic className="h-4 w-4" />}
            label="Italic"
          />
          <ToolbarButton
            onToggle={(e) => toggleInlineStyle(e, 'UNDERLINE')}
            style="UNDERLINE"
            icon={<Underline className="h-4 w-4" />}
            label="Underline"
          />
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" role="separator" />
          <ToolbarButton
            onToggle={(e) => toggleBlockType(e, 'unordered-list-item')}
            style="unordered-list-item"
            icon={<List className="h-4 w-4" />}
            label="Bullet List"
          />
          <ToolbarButton
            onToggle={(e) => toggleBlockType(e, 'ordered-list-item')}
            style="ordered-list-item"
            icon={<ListOrdered className="h-4 w-4" />}
            label="Numbered List"
          />
        </div>
      )}
      <div 
        className={`p-3 min-h-[100px] cursor-text ${readOnly ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
        onClick={focusEditor}
        onFocus={focusEditor}
        tabIndex={-1}
      >
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={handleEditorChange}
          placeholder={placeholder}
          readOnly={readOnly}
          handleKeyCommand={handleKeyCommand}
          handleReturn={handleReturn}
          tabIndex={0}
        />
      </div>
    </div>
  );
} 