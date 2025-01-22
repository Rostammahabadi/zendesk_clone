import { useState, useEffect, useRef } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, DraftHandleValue } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export function RichTextEditor({
  initialContent,
  onChange,
  placeholder = '',
  className = '',
  readOnly = false
}: RichTextEditorProps) {
  const editorRef = useRef<Editor>(null);
  const [editorState, setEditorState] = useState(() => {
    if (initialContent) {
      try {
        const contentState = convertFromRaw(JSON.parse(initialContent));
        return EditorState.createWithContent(contentState);
      } catch {
        return EditorState.createEmpty();
      }
    }
    return EditorState.createEmpty();
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const content = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
      onChange(content);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [editorState, onChange]);

  const handleEditorChange = (state: EditorState) => {
    setEditorState(state);
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

  const toggleInlineStyle = (e: React.MouseEvent, style: string) => {
    e.preventDefault();
    const newState = RichUtils.toggleInlineStyle(editorState, style);
    handleEditorChange(newState);
    setTimeout(() => editorRef.current?.focus(), 0);
  };

  const toggleBlockType = (e: React.MouseEvent, blockType: string) => {
    e.preventDefault();
    const newState = RichUtils.toggleBlockType(editorState, blockType);
    handleEditorChange(newState);
    setTimeout(() => editorRef.current?.focus(), 0);
  };

  const ToolbarButton = ({ onClick, active, icon: Icon, title }: any) => (
    <button
      type="button"
      onMouseDown={onClick}
      className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
        active ? 'bg-gray-100 dark:bg-gray-700' : ''
      }`}
      title={title}
    >
      <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
    </button>
  );

  return (
    <div 
      className={`border rounded-lg dark:border-gray-700 ${className}`}
      onClick={focusEditor}
    >
      {!readOnly && (
        <div className="flex items-center gap-1 p-2 border-b dark:border-gray-700">
          <ToolbarButton
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              toggleInlineStyle(e, 'BOLD');
            }}
            active={editorState.getCurrentInlineStyle().has('BOLD')}
            icon={Bold}
            title="Bold"
          />
          <ToolbarButton
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              toggleInlineStyle(e, 'ITALIC');
            }}
            active={editorState.getCurrentInlineStyle().has('ITALIC')}
            icon={Italic}
            title="Italic"
          />
          <ToolbarButton
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              toggleInlineStyle(e, 'UNDERLINE');
            }}
            active={editorState.getCurrentInlineStyle().has('UNDERLINE')}
            icon={Underline}
            title="Underline"
          />
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
          <ToolbarButton
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              toggleBlockType(e, 'unordered-list-item');
            }}
            active={
              RichUtils.getCurrentBlockType(editorState) === 'unordered-list-item'
            }
            icon={List}
            title="Bullet List"
          />
          <ToolbarButton
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              toggleBlockType(e, 'ordered-list-item');
            }}
            active={
              RichUtils.getCurrentBlockType(editorState) === 'ordered-list-item'
            }
            icon={ListOrdered}
            title="Numbered List"
          />
        </div>
      )}
      <div className="p-3 min-h-[100px] cursor-text">
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={handleEditorChange}
          handleKeyCommand={handleKeyCommand}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
} 