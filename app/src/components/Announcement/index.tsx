import {
    BoxIcon,
    CheckboxIcon,
    DiscordLogoIcon,
    GitHubLogoIcon,
    LayersIcon,
} from '@radix-ui/react-icons';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';
import { Input } from '../ui/input';
import { Toggle } from '../ui/toggle';

function Announcement() {
    const [checked, setChecked] = useState(false);

    return (
        <Dialog open={true}>
            <DialogContent className="text-white/60 space-x-2 text-sm space-y-2">
                <div className="w-[calc(100%+3rem)] h-72 -m-6 mb-0 border-b rounded-t"></div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <p>Stay up to date with Onlook</p>
                        <div className="flex flex-row space-x-2">
                            <Input
                                className="bg-bg outline-none"
                                placeholder="contact@onlook.dev"
                            />
                            <Button variant={'outline'}>Email me updates</Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2">
                        <div className="space-y-2">
                            <p>Resources</p>
                            <div className="flex flex-col space-y-1 ml-2">
                                <div className="flex flex-row items-center">
                                    <GitHubLogoIcon className="mr-2" /> Star Github Repo
                                </div>
                                <div className="flex flex-row items-center">
                                    <DiscordLogoIcon className="mr-2" />
                                    Join Discord
                                </div>
                                <div className="flex flex-row items-center">
                                    <LayersIcon className="mr-2" /> Browse Docs
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p>Settings</p>
                            <div className="flex flex-row items-center space-x-2">
                                <Toggle
                                    className="p-0 px-3 rounded data-[state=on]:bg-bg-positive data-[state=on]:text-teal-700"
                                    onPressedChange={(value) => setChecked(value)}
                                >
                                    {checked ? <CheckboxIcon /> : <BoxIcon />}
                                </Toggle>
                                <div className="text-xs">
                                    <p className="text-white">Share anonymized analytics</p>
                                    <p>This helps our small team a lot!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default Announcement;
