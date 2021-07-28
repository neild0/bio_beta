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

  useEffect(() => {
    async function init() {
      plugin.current = await createPluginAsync(parent.current, MySpec);
      setInitialized(true);
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

  return <div ref={parent} />;
};

export default MolstarRender;
