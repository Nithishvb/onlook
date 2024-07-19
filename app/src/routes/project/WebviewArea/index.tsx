import { WebviewMessageBridge } from '@/lib/editor/messageBridge';
import { WebviewMetadata } from '@/lib/models';
import { nanoid } from 'nanoid';
import { useEditorEngine } from '..';
import Frame from './Frame';
import Overlay from './Overlay';

function WebviewArea() {
    const editorEngine = useEditorEngine();
    const messageBridge = new WebviewMessageBridge(editorEngine);
    const webviews: WebviewMetadata[] = [
        {
            id: nanoid(),
            title: 'Desktop',
            src: ' http://localhost:3000/',
        },
    ];

    return (
        <Overlay>
            <div className="grid grid-flow-col gap-72">
                {webviews.map((metadata, index) => (
                    <Frame key={index} metadata={metadata} messageBridge={messageBridge} />
                ))}
            </div>
        </Overlay>
    );
}

export default WebviewArea;
