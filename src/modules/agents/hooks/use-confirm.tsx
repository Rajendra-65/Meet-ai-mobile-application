import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/responsive-dialog";

type UseConfirmArgs = {
  title: string;
  description: string;
};

type ConfirmHookReturn = [React.FC, () => Promise<boolean>];

/**
 * useConfirm
 * Usage:
 *   const [ConfirmDialog, confirm] = useConfirm({ title: "Delete?", description: "This cannot be undone." });
 *   const onDelete = async () => {
 *     if (await confirm()) { ...do it... }
 *   };
 *   return (<><ConfirmDialog /> ...</>);
 */
export function useConfirm({ title, description }: UseConfirmArgs): ConfirmHookReturn {
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleClose = useCallback(() => {
    // If user closes the dialog without clicking anything, treat as cancel
    if (resolver) resolver(false);
    setResolver(null);
  }, [resolver]);

  const handleCancel = useCallback(() => {
    if (resolver) resolver(false);
    setResolver(null);
  }, [resolver]);

  const handleConfirm = useCallback(() => {
    if (resolver) resolver(true);
    setResolver(null);
  }, [resolver]);

  const ConfirmationDialog: React.FC = useCallback(() => {
    return (
      <ResponsiveDialog
        open={resolver !== null}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
        title={title}
        description={description}
      >
        <div className="pt-4 w-full flex flex-col-reverse gap-y-2 lg:flex-row lg:gap-x-2 items-center justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full lg:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="w-full lg:w-auto"
          >
            Confirm
          </Button>
        </div>
      </ResponsiveDialog>
    );
  }, [resolver, handleClose, handleCancel, handleConfirm, title, description]);

  return [ConfirmationDialog, confirm];
}
