import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface Tag {
  id: string;
  name: string;
}

interface TagInputProps {
  className?: string;
  placeholder?: string;
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
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
      if (!tags.some(tag => tag.name.toLowerCase() === inputValue.trim().toLowerCase())) {
        // If the input is not a UUID, treat it as a new tag name
        if (!inputValue.trim().match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
          onTagsChange([...tags, { id: inputValue.trim(), name: inputValue.trim() }]);
        }
      }
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: Tag) => {
    onTagsChange(tags.filter((tag) => tag.id !== tagToRemove.id));
  };

  return (
    <div
      className={`flex items-center flex-wrap gap-2 min-h-[2rem] p-1 -m-1 ${className}`}
    >
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md"
        >
          {tag.name}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-gray-900 dark:hover:text-gray-100"
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
        className="flex-1 min-w-[120px] border-0 bg-transparent p-0 text-sm focus:ring-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
      />
    </div>
  );
}
