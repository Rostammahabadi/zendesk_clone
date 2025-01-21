import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
interface TagInputProps {
  className?: string;
  placeholder?: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}
export function TagInput({
  className = "",
  placeholder = "Add tags...",
  tags,
  onTagsChange,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        onTagsChange([...tags, inputValue.trim()]);
      }
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };
  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };
  return (
    <div
      className={`flex items-center flex-wrap gap-2 min-h-[2rem] p-1 -m-1 ${className}`}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-gray-900"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] border-0 bg-transparent p-0 text-sm focus:ring-0"
      />
    </div>
  );
}
