import { invokeMainChannel } from '@/lib/utils';
import { MessageContextType, type ImageMessageContext } from '@onlook/models/chat';
import { MainChannels } from '@onlook/models/constants';
import { Button } from '@onlook/ui/button';
import { Card, CardContent, CardHeader } from '@onlook/ui/card';
import { Icons } from '@onlook/ui/icons';
import { Input } from '@onlook/ui/input';
import { Textarea } from '@onlook/ui/textarea';
import { cn } from '@onlook/ui/utils';
import { useState, useRef } from 'react';
import { Tooltip, TooltipContent, TooltipPortal, TooltipTrigger } from '@onlook/ui/tooltip';
import { AnimatePresence } from 'motion/react';
import { DraftImagePill } from '../../editor/EditPanel/ChatTab/ContextPills/DraftingImagePill';

export const PromptCreation = () => {
    const [inputValue, setInputValue] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [selectedImages, setSelectedImages] = useState<ImageMessageContext[]>([]);
    const [imageTooltipOpen, setImageTooltipOpen] = useState(false);
    const [isHandlingFile, setIsHandlingFile] = useState(false);
    const [textareaHeight, setTextareaHeight] = useState('auto');

    // Add a ref for the textarea
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = () => {
        if (inputValue.trim().length < 10) {
            return;
        }
        invokeMainChannel(MainChannels.CREATE_NEW_PROJECT_PROMPT, {
            prompt: inputValue,
            images: selectedImages,
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        setImageTooltipOpen(false);
        // Find and reset the container's data attribute
        const container = e.currentTarget.closest('.bg-background-secondary');
        if (container) {
            container.setAttribute('data-dragging-image', 'false');
        }
        const files = Array.from(e.dataTransfer.files);
        handleNewImageFiles(files);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsHandlingFile(true);
        setImageTooltipOpen(false);
        const files = Array.from(e.target.files || []);
        handleNewImageFiles(files);
    };

    const handleNewImageFiles = async (files: File[]) => {
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));

        const imageContexts: ImageMessageContext[] = [];
        if (imageFiles.length > 0) {
            // Handle the dropped image files
            for (const file of imageFiles) {
                const imageContext = await createImageMessageContext(file);
                if (imageContext) {
                    imageContexts.push(imageContext);
                }
            }
        }
        console.log('imageContexts', imageContexts);
        setSelectedImages([...selectedImages, ...imageContexts]);
        setIsHandlingFile(false);
    };

    const handleRemoveImage = (imageContext: ImageMessageContext) => {
        setSelectedImages(selectedImages.filter((f) => f !== imageContext));
    };

    const createImageMessageContext = async (file: File): Promise<ImageMessageContext | null> => {
        try {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result as string);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            return {
                type: MessageContextType.IMAGE,
                content: base64,
                displayName: file.name,
                mimeType: file.type,
            };
        } catch (error) {
            console.error('Error reading file:', error);
            return null;
        }
    };

    const handleDragStateChange = (isDragging: boolean, e: React.DragEvent) => {
        const hasImage =
            e.dataTransfer.types.length > 0 &&
            Array.from(e.dataTransfer.items).some(
                (item) =>
                    item.type.startsWith('image/') ||
                    (item.type === 'Files' && e.dataTransfer.types.includes('public.file-url')),
            );
        if (hasImage) {
            setIsDragging(isDragging);
            // Find the container div with the bg-background-secondary class
            const container = e.currentTarget.closest('.bg-background-secondary');
            if (container) {
                container.setAttribute('data-dragging-image', isDragging.toString());
            }
        }
    };

    const handleContainerClick = (e: React.MouseEvent) => {
        // Don't focus if clicking on a button, pill, or the textarea itself
        if (
            e.target instanceof Element &&
            (e.target.closest('button') ||
                e.target.closest('.group') || // Pills have 'group' class
                e.target === textareaRef.current)
        ) {
            return;
        }

        textareaRef.current?.focus();
    };

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            // Reset height to auto to get the correct scrollHeight
            textareaRef.current.style.height = 'auto';

            // Calculate lines based on line height (assuming 1.5 line height for text-small)
            const lineHeight = 20; // Approximate line height in pixels
            const maxHeight = lineHeight * 10; // 10 lines maximum

            const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    };

    return (
        <div className="flex items-center justify-center p-4">
            <Card className={cn('w-[600px] mb-32 bg-background', isDragging && 'bg-background')}>
                <CardHeader>
                    <h2 className="text-2xl text-foreground-primary">
                        What kind of website do you want to make?
                    </h2>
                    <p className="text-sm text-foreground-secondary">
                        Tell us a bit about your project. Be as detailed as possible.
                    </p>
                </CardHeader>
                <CardContent>
                    <div
                        className={cn(
                            'flex flex-col gap-3 bg-background-secondary rounded p-0 transition-colors duration-200 cursor-text',
                            '[&[data-dragging-image=true]]:bg-teal-500/40',
                            isDragging && 'bg-teal-500/40', // Add direct class for dragging state
                            isDragging && 'cursor-copy',
                        )}
                        onClick={handleContainerClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div
                            className={`flex flex-col w-full ${selectedImages.length > 0 ? 'p-4' : 'px-4 py-2'}`}
                        >
                            <div
                                className={cn(
                                    'flex flex-row flex-wrap w-full gap-1.5 text-micro text-foreground-secondary',
                                    selectedImages.length > 0 ? 'min-h-6' : 'h-0',
                                )}
                            >
                                <AnimatePresence mode="popLayout">
                                    {selectedImages.map((imageContext, index) => (
                                        <DraftImagePill
                                            key={`image-${index}-${imageContext.content}`}
                                            context={imageContext}
                                            onRemove={() => handleRemoveImage(imageContext)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                            <Textarea
                                ref={textareaRef}
                                className={cn(
                                    'mt-2 overflow-auto min-h-[60px] text-small p-0 border-0 shadow-none rounded-none caret-[#FA003C]',
                                    'selection:bg-[#FA003C]/30 selection:text-[#FA003C] text-foreground-primary',
                                    'placeholder:text-foreground-primary/50',
                                    'cursor-text',
                                )}
                                placeholder="Paste a reference screenshot, write a novel, get creative..."
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                    adjustTextareaHeight();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (inputValue.trim().length >= 10) {
                                            handleSubmit();
                                        }
                                    }
                                }}
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDragStateChange(true, e);
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDragStateChange(true, e);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                        handleDragStateChange(false, e);
                                    }
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDragStateChange(false, e);
                                    handleDrop(e);
                                }}
                                rows={3}
                                style={{ resize: 'none' }}
                            />
                        </div>
                        <div className="flex flex-row w-full justify-between pt-2 pb-2 px-2">
                            <div className="flex flex-row justify-start gap-1.5">
                                <Tooltip
                                    open={imageTooltipOpen && !isHandlingFile}
                                    onOpenChange={(open) =>
                                        !isHandlingFile && setImageTooltipOpen(open)
                                    }
                                >
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-9 h-9 text-foreground-tertiary group hover:bg-transparent"
                                            onClick={() =>
                                                document.getElementById('image-input')?.click()
                                            }
                                        >
                                            <input
                                                id="image-input"
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={handleFileSelect}
                                            />
                                            <Icons.Image
                                                className={cn(
                                                    'w-5 h-5',
                                                    'group-hover:text-foreground',
                                                )}
                                            />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipPortal>
                                        <TooltipContent side="top" sideOffset={5}>
                                            Upload Image Reference
                                        </TooltipContent>
                                    </TooltipPortal>
                                </Tooltip>
                                <Button
                                    variant="outline"
                                    className="w-fit h-fit py-0.5 px-2.5 text-foreground-tertiary hidden"
                                >
                                    <Icons.FilePlus className="mr-2" />
                                    <span className="text-smallPlus">File Reference</span>
                                </Button>
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className={cn(
                                            'text-smallPlus w-fit h-full py-2 px-2',
                                            inputValue.trim().length >= 10
                                                ? 'bg-foreground-primary text-white hover:bg-foreground-hover'
                                                : 'text-primary',
                                        )}
                                        disabled={!inputValue || inputValue.trim().length < 10}
                                        onClick={handleSubmit}
                                    >
                                        <Icons.ArrowRight
                                            className={cn(
                                                'w-5 h-5',
                                                inputValue.trim().length >= 10
                                                    ? 'text-background'
                                                    : 'text-foreground-primary',
                                            )}
                                        />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Start building your site</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PromptCreation;
