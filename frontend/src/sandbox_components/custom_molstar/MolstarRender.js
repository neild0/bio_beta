import React, { useEffect, useRef, useState } from "react";

import "../../themes/molstar-theme.css";
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
import { UncertaintyColorThemeProvider } from "molstar/lib/mol-theme/color/uncertainty";
import { ParamDefinition as PD } from "molstar/lib/mol-util/param-definition";
import { getColorListFromName } from "molstar/lib/mol-util/color/lists";
import { ColorList } from "molstar/lib/mol-util/color/color";
import {StructureElement, StructureProperties as Props} from "molstar/lib/mol-model/structure";
import { labelProvider } from "./label"

const MySpec = {
  ...DefaultPluginUISpec(),
  config: [
    [PluginConfig.VolumeStreaming.Enabled, false],
    [PluginConfig.Viewport.ShowExpand, true],
    [PluginConfig.Viewport.ShowControls, true],
    [PluginConfig.Viewport.ShowSettings, false],
    [PluginConfig.Viewport.ShowAnimation, false],
  ],
  components: {
    ...DefaultPluginUISpec().components,
    hideTaskOverlay: false,
    // controls: { left: "full", right: "full", top: "full", bottom: "full" },
  },
  layout: {
    initial: {
      showControls: true,
      isExpanded: false,
      regionState: {
        left: "hidden",
        right: "hidden",
        top: "full",
        bottom: "hidden",
      },
    },
  },
};

const MolstarRender = (props) => {
  const { pdb, options } = props;
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
    loadStructureFromData(pdb, "pdb");
    // sync state here
  }, [initialized, pdb]);

  async function loadStructureFromData(data, format, options) {
    const _data = await plugin.current.builders.data.rawData({
      data,
      label: options?.dataLabel,
    });
    const trajectory = await plugin.current.builders.structure.parseTrajectory(
      _data,
      format
    );
    const model = await plugin.current.builders.structure.createModel(
      trajectory
    );
    const structure = await plugin.current.builders.structure.createStructure(
      model
    );

    const components = {
      polymer: await plugin.current.builders.structure.tryCreateComponentStatic(
        structure,
        "polymer"
      ),
      ligand: await plugin.current.builders.structure.tryCreateComponentStatic(
        structure,
        "ligand"
      ),
      water: await plugin.current.builders.structure.tryCreateComponentStatic(
        structure,
        "water"
      ),
    };

    const builder = plugin.current.builders.structure.representation;
    const update = plugin.current.build();
    plugin.current.managers.lociLabels.clearProviders()
    plugin.current.managers.lociLabels.addProvider(labelProvider)

    // const colors = getColorListFromName('turbo');
    // add another exp of color values to make discrete colors more apparent
    const colors = ColorList(
      "alphafold",
      "qualitative",
      "Improved (smooth) rainbow colormap for visualization",
      errorColors
    );
    const colorParams = { list: { kind: "set", colors: colors.list } };

    if (components.polymer)
      builder.buildRepresentation(
        update,
        components.polymer,
        { type: "cartoon", color: "uncertainty", colorParams: colorParams },
        { tag: "polymer" }
      );
    if (components.ligand)
      builder.buildRepresentation(
        update,
        components.ligand,
        { type: "ball-and-stick" },
        { tag: "ligand" }
      );
    if (components.water)
      builder.buildRepresentation(
        update,
        components.water,
        { type: "ball-and-stick", typeParams: { alpha: 0.6 } },
        { tag: "water" }
      );

    await update.commit();

  }

  return <div ref={parent} />;
};

const createErrorColors = (exp) => {
  let colors = [];
  for (let i = 0; i < exp; i++) {
    colors.push(0x7824ff);
  }
  for (let i = 0; i < exp * 2; i++) {
    colors.push(0x55bff0);
  }
  for (let i = 0; i < exp * 2; i++) {
    colors.push(0xffde38);
  }
  for (let i = 0; i < exp * 5; i++) {
    colors.push(0xff7300);
  }
  return colors;
};
const errorColors = createErrorColors(16);

export default MolstarRender;
