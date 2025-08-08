import { Dispatch, ReactNode, SetStateAction } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import {
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandResponsiveDialog
} from "@/components/ui/command";

interface Props {
  options: Array<{
    id: string;
    value: string;
    children: ReactNode;
  }>;
  onSelect: (value: string) => void;
  onSearch?: (value: string) => void;
  value: string;
  placeholder?: string;
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  isSearchable?: boolean;
  className?: string;
}

export const CommandSelect = ({
  options,
  onSelect,
  onSearch,
  value,
  placeholder,
  className,
  open,
  onOpenChange
}: Props) => {
  const selectedOption = options.find((option) => option.value === value);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset search if closing
      onSearch?.("");
    }
    onOpenChange(isOpen);
  };

  return (
    <>
      <Button
        onClick={() => onOpenChange(true)}
        type="button"
        variant="outline"
        className={cn(
          "h-9 justify-between font-normal px-2",
          !selectedOption && "text-muted-foreground",
          className
        )}
      >
        {selectedOption?.children ?? "Select option"}
      </Button>

      <CommandResponsiveDialog
        shouldFilter={!onSearch}
        open={open}
        onOpenChange={handleOpenChange}
      >
        {onSearch && (
          <CommandInput
            placeholder={placeholder || "Search..."}
            onValueChange={onSearch}
          />
        )}

        <CommandList>
          <CommandEmpty>
            <span className="text-muted-foreground text-sm">
              No Options Found
            </span>
          </CommandEmpty>
          {options.map((option) => (
            <CommandItem
              key={option.id}
              onSelect={() => {
                onSelect(option.value);
                onOpenChange(false);
              }}
            >
              {option.children}
            </CommandItem>
          ))}
        </CommandList>
      </CommandResponsiveDialog>
    </>
  );
};
