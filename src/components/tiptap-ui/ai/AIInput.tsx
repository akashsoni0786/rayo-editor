// @ts-nocheck
import React, { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

interface AIInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const AIInput: React.FC<AIInputProps> = ({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  placeholder = 'Ask AI to edit or generate...',
  disabled = false
}) => {
  return (
    <div className="p-4 border-t border-gray-100 w-80">
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full pr-12"
          autoFocus
          disabled={disabled}
        />
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={!value.trim() || disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300"
        >
          <ArrowUp className="h-3 w-3 text-white" />
        </Button>
      </div>
    </div>
  );
};