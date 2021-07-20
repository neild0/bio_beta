import React from "react";
import { DefaultPluginUISpec, PluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { createPluginAsync } from 'molstar/lib/mol-plugin-ui/index';
import { PluginConfig } from 'molstar/lib/mol-plugin/config';

const MySpec = {
    ...DefaultPluginUISpec(),
    config: [
        [PluginConfig.VolumeStreaming.Enabled, false]
    ]
}

async function createPlugin(parent) {
    const plugin = await createPluginAsync(parent, MySpec);

    const data = await plugin.builders.data.download({ url: '...' }, { state: { isGhost: true } });
    return plugin;
}

function MolStarWrapper() {
    const parent = React.createRef<HTMLDivElement | null>();

    useEffect(() => {
        let plugin;
        async function init() {
            plugin = createPlugin(parent.current);
        }
        init();
        return () => { plugin?.dispose(); };
    }, []);

    return <div ref={parent} style={{ width: 640, height: 480 }} />;
}

class ProtViz extends React.Component {

    render() {
        return (
            MolStarWrapper()
        )
    }
}