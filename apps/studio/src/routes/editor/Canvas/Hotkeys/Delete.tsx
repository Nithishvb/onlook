import { useEditorEngine, useUserManager } from '@/components/Context';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@onlook/ui/alert-dialog';
import { Button } from '@onlook/ui/button';
import { Checkbox } from '@onlook/ui/checkbox';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Hotkey } from '/common/hotkeys';

const DeleteKey = () => {
    const editorEngine = useEditorEngine();
    const userManager = useUserManager();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [shouldWarnDelete, setShouldWarnDelete] = useState(
        userManager.user?.shouldWarnDelete ?? true,
    );

    useHotkeys([Hotkey.BACKSPACE.command, Hotkey.DELETE.command], () => {
        if (
            editorEngine.webviews.selected.length > 0 &&
            editorEngine.elements.selected.length === 0
        ) {
            deleteDuplicateWindow();
        } else {
            if (shouldWarnDelete) {
                setShowDeleteDialog(true);
            } else {
                editorEngine.elements.delete();
            }
        }
    });

    function disableWarning(disable: boolean) {
        userManager.updateUserSettings({ shouldWarnDelete: disable });
        setShouldWarnDelete(disable);
    }

    const handleDelete = () => {
        editorEngine.elements.delete();
        setShowDeleteDialog(false);
    };

    function deleteDuplicateWindow() {
        const settings = editorEngine.canvas.getFrame(editorEngine.webviews.selected[0].id);
        if (settings && settings.duplicate) {
            editorEngine.canvas.frames = editorEngine.canvas.frames.filter(
                (frame) => frame.id !== settings.id,
            );

            editorEngine.canvas.frames.forEach((frame) => {
                frame.linkedIds = frame.linkedIds?.filter((id) => id !== settings.id) || null;
            });

            const webview = editorEngine.webviews.getWebview(settings.id);
            if (webview) {
                editorEngine.webviews.deregister(webview);
            }
        }
    }

    return (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{'Delete this element?'}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {'This will delete the element in code. You can undo this action.'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="disable-warning"
                        onCheckedChange={(checked) => disableWarning(checked !== true)}
                    />
                    <label
                        htmlFor="disable-warning"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        {"Don't show this warning again"}
                    </label>
                </div>
                <AlertDialogFooter>
                    <Button variant={'ghost'} onClick={() => setShowDeleteDialog(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant={'destructive'}
                        className="rounded-md text-sm"
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteKey;
