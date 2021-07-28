import React, { useEffect, useRef, useState } from "react";

import "../themes/molstar-theme.css";
import { createPluginAsync } from "molstar/lib/mol-plugin-ui/index";

import {
  DefaultPluginUISpec,
  PluginUISpec,
} from "molstar/lib/mol-plugin-ui/spec";
import { PluginConfig } from "molstar/lib/mol-plugin/config";
import {
  DownloadStructure,
  PdbDownloadProvider,
} from "molstar/lib/mol-plugin-state/actions/structure";

const MySpec = {
  ...DefaultPluginUISpec(),
  config: [
    [PluginConfig.VolumeStreaming.Enabled, false],
    [PluginConfig.Viewport.ShowExpand, false],
    [PluginConfig.Viewport.ShowControls, false],
    [PluginConfig.Viewport.ShowSettings, false],
    [PluginConfig.Viewport.ShowAnimation, false],
  ],
  layout: { initial: { showControls: false } },
};

const MolstarRender = (props) => {
  const { pdbId, url, options } = props;
  const parent = React.createRef();
  const [initialized, setInitialized] = React.useState(false);
  const plugin = React.useRef();

  function loadPdb(pdb, options) {
    const params = DownloadStructure.createDefaultParams(
      plugin.state.data.root.obj,
      this.plugin
    );
    const provider = plugin.config.get(
      PluginConfig.Download.DefaultPdbProvider
    );
    return plugin.runTask(
      this.plugin.state.data.applyAction(DownloadStructure, {
        source: {
          name: "pdb",
          params: {
            provider: {
              id: pdb,
              server: {
                name: provider,
                params: PdbDownloadProvider[provider].defaultValue,
              },
            },
            options: {
              ...params.source.params.options,
              representationParams: options?.representationParams,
            },
          },
        },
      })
    );
  }

  useEffect(() => {
    async function init() {
      plugin.current = await createPluginAsync(parent.current, MySpec);
      setInitialized(true);
      plugin.current.loadPdb("7E0O");
    }
    init();

    return () => {
      plugin.current?.dispose();
      plugin.current = null;
    };
  }, []);

  useEffect(() => {
    if (!initialized || !plugin.current) return;

    // sync state here
  }, [initialized, pdbId, url]);

  async function loadStructureFromData(data, format, options) {
    const _data = await plugin.builders.data.rawData({
      data,
      label: options?.dataLabel,
    });
    const trajectory = await plugin.builders.structure.parseTrajectory(
      _data,
      format
    );
    await plugin.builders.structure.hierarchy.applyPreset(
      trajectory,
      "default"
    );
  }

  return <div ref={parent} style={{ width: 640, height: 480 }} />;
};

export default MolstarRender;
