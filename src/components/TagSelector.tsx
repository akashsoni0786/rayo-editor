import React, { useState, KeyboardEvent, useRef } from 'react';
import { Plus, X } from 'lucide-react';

interface TagSelectorProps {
  label: string;
  tags: string[];
  suggestions: string[];
  onChange: (tags: string[]) => void;
  allowCustom?: boolean;
}

export default function TagSelector({ 
  label, 
  tags, 
  suggestions, 
  onChange,
  allowCustom = true
}: TagSelectorProps) {
  const [newTag, setNewTag] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    if (!tag.trim() || tags.includes(tag)) return;
    onChange([...tags, tag.trim()]);
    setNewTag('');
    setShowSuggestions(false);
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && allowCustom) {
      e.preventDefault();
      addTag(newTag);
    } else if (e.key === 'Tab' && showSuggestions) {
      e.preventDefault();
      const filteredSuggestions = suggestions
        .filter(s => !tags.includes(s) && s.toLowerCase().includes(newTag.toLowerCase()));
      if (filteredSuggestions.length > 0) {
        addTag(filteredSuggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setShowSuggestions(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-2">
      <label className="block text-[#0e0f11] text-sm font-medium font-['Inter'] leading-[21px]">
        {label}
      </label>

      <div className="bg-white rounded-lg border border-gray-100 p-2">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium font-['Inter'] text-[#0e0f11] bg-gray-50"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>

        <div className="relative mt-2" ref={dropdownRef}>
          <input
            ref={inputRef}
            type="text"
            value={newTag}
            onChange={(e) => {
              setNewTag(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            className="w-full px-3 py-1.5 bg-gray-50 rounded-lg text-sm font-medium font-['Inter'] text-[#0e0f11] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder={allowCustom ? "Type to add or select from suggestions..." : "Select from suggestions..."}
          />

          {showSuggestions && (suggestions.length > 0) && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-10">
              <div className="p-1 max-h-48 overflow-y-auto dropdown-scroll scroll-hover">
                {suggestions
                  .filter(s => !tags.includes(s) && s.toLowerCase().includes(newTag.toLowerCase()))
                  .map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => addTag(suggestion)}
                      className="w-full text-left px-3 py-1.5 text-sm font-medium font-['Inter'] text-[#0e0f11] rounded hover:bg-gray-50 flex items-center gap-2"
                    >
                      {suggestion}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}