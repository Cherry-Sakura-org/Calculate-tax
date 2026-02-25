import { useState, useCallback } from 'react';

/**
 * A custom hook used to control dialog state.
 *
 * @template T - The type of the dialog payload.
 * @param {boolean} [show=false] - Initial visibility state of the dialog.
 * @returns {[boolean, (payload?: T) => void, () => void, boolean, T | null]} A tuple containing:
 *   - showDialog: boolean - Whether the dialog is currently shown.
 *   - openDialog: (payload?: T) => void - Function to open the dialog with an optional payload.
 *   - closeDialog: () => void - Function to close the dialog.
 *   - mountDialog: boolean - Indicates if the dialog can be mounted.
 *   - dialogPayload: T | null - The current payload of the dialog.
 *
 * @example
 * // Using with a specific payload type
 * interface DialogData {
 *   title: string;
 *   content: string;
 * }
 *
 * const [showDialog, openDialog, closeDialog, mountDialog, dialogPayload] = useDialog<DialogData>(false);
 *
 * // Opening the dialog with payload
 * openDialog({ title: 'Confirm Delete', content: 'Are you sure you want to delete this item?' });
 *
 * // Closing the dialog
 * closeDialog();
 */
export const useDialog = <T = unknown>(
    show: boolean = false,
): [
    showDialog: boolean,
    openDialog: (payload?: T) => void,
    closeDialog: () => void,
    mountDialog: boolean,
    dialogPayload: T | null,
] => {
    const [showDialog, setShowDialog] = useState<boolean>(show);
    const [canBeUnmount, setCanBeUnmount] = useState<boolean>(!show);
    const [dialogPayload, setDialogPayload] = useState<T | null>(null);

    /**
     * Opens the dialog with an optional payload.
     *
     * @param {T} [payload] - The payload to pass to the dialog.
     */
    const openDialog = useCallback((payload?: T) => {
        setDialogPayload(payload ?? null);
        setShowDialog(true);
        setCanBeUnmount(false);
    }, []);

    /**
     * Closes the dialog and handles unmounting after a delay.
     */
    const closeDialog = useCallback(() => {
        setShowDialog(false);
        setTimeout(() => {
            setCanBeUnmount(true);
            setDialogPayload(null);
        }, 250);
    }, []);

    return [showDialog, openDialog, closeDialog, !canBeUnmount, dialogPayload];
};
