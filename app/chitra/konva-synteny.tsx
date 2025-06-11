"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Line, Group, Shape } from 'react-konva/lib/ReactKonvaCore';
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RefreshCw, Maximize2, Minimize2, Save, ArrowLeftRight, ArrowRight, ArrowLeft, ArrowLeftFromLine } from "lucide-react";
import { AlignmentFilterButton } from './chromosome-synteny';
import 'konva/lib/shapes/Text';
import 'konva/lib/shapes/Rect';
import 'konva/lib/shapes/Line';
import Konva from 'konva';
import * as d3 from 'd3';
import { ChromosomeData, SyntenyData } from '../types';

interface KonvaSyntenyProps {
  referenceData: ChromosomeData[];
  syntenyData: SyntenyData[];
  alignmentFilter: 'all' | 'forward' | 'reverse';
  setAlignmentFilter: (filter: 'all' | 'forward' | 'reverse') => void;
  onBack: () => void;
}

export const KonvaSynteny: React.FC<KonvaSyntenyProps> = ({ referenceData: initialReferenceData, syntenyData, alignmentFilter, setAlignmentFilter, onBack }) => {
  const [referenceData, setReferenceData] = useState(initialReferenceData);
  const [chromosomePositions, setChromosomePositions] = useState<any>({});
  const [stage, setStage] = useState({
    scale: 1,
    x: 0,
    y: 0,
  });
  const [tooltip, setTooltip] = useState({
    x: 0,
    y: 0,
    text: '',
    visible: false,
  });
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    const initialPositions: any = {};
    let yOffset = 50;
    const speciesGroups = d3.group(referenceData, d => d.species_name);
    const uniqueSpecies = Array.from(speciesGroups.keys());
    uniqueSpecies.forEach((species, speciesIndex) => {
      const speciesData = referenceData.filter(d => d.species_name === species);
      let xOffset = 100;
      speciesData.forEach(chr => {
        initialPositions[`${chr.species_name}:${chr.chr_id}`] = { x: xOffset, y: yOffset };
        xOffset += xScale(chr.chr_size_bp) + chromosomeSpacing;
      });
      yOffset += speciesSpacing;
    });
    setChromosomePositions(initialPositions);
  }, [referenceData]);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const scaleBy = 1.05;
    const stage = e.target.getStage();
    if (!stage) {
      return;
    }
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition()!.x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition()!.y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setStage({
      scale: newScale,
      x: (stage.getPointerPosition()!.x / newScale - mousePointTo.x) * newScale,
      y: (stage.getPointerPosition()!.y / newScale - mousePointTo.y) * newScale,
    });
  };

  const speciesGroups = d3.group(referenceData, d => d.species_name);
  const uniqueSpecies = Array.from(speciesGroups.keys());
  const speciesColorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(uniqueSpecies);
  const speciesSpacing = 150;
  const chromosomeHeight = 20;
  const chromosomeSpacing = 10;
  const maxChrSize = d3.max(referenceData, d => d.chr_size_bp) || 0;
  const xScale = d3.scaleLinear().domain([0, maxChrSize]).range([0, 800]);

  const getChromosomePosition = (chrId: string, speciesName: string) => {
    const pos = chromosomePositions[`${speciesName}:${chrId}`];
    if (pos) {
      const chr = referenceData.find(c => c.chr_id === chrId && c.species_name === speciesName);
      if (chr) {
        return { ...pos, width: xScale(chr.chr_size_bp) };
      }
    }
    return null;
  };

  const handleZoomIn = () => {
    if (stageRef.current) {
      const oldScale = stageRef.current.scaleX();
      const newScale = oldScale * 1.2;
      setStage({ ...stage, scale: newScale });
    }
  };

  const handleZoomOut = () => {
    if (stageRef.current) {
      const oldScale = stageRef.current.scaleX();
      const newScale = oldScale / 1.2;
      setStage({ ...stage, scale: newScale });
    }
  };

  const handleReset = () => {
    setStage({ scale: 1, x: 0, y: 0 });
  };

  const filteredSyntenyData = syntenyData.filter(link => {
    if (alignmentFilter === 'all') {
      return true;
    }
    return link.query_strand === (alignmentFilter === 'forward' ? '+' : '-');
  });

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeftFromLine className="h-4 w-4" />
        </Button>
        <AlignmentFilterButton
          filter="all"
          currentFilter={alignmentFilter}
          onClick={setAlignmentFilter}
          icon={ArrowLeftRight}
          label="All"
        />
        <AlignmentFilterButton
          filter="forward"
          currentFilter={alignmentFilter}
          onClick={setAlignmentFilter}
          icon={ArrowRight}
          label="Forward"
        />
        <AlignmentFilterButton
          filter="reverse"
          currentFilter={alignmentFilter}
          onClick={setAlignmentFilter}
          icon={ArrowLeft}
          label="Reverse"
        />
      </div>
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleReset}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <Stage
        ref={stageRef}
        width={window.innerWidth - 100}
        height={window.innerHeight}
        onWheel={handleWheel}
        scaleX={stage.scale}
        scaleY={stage.scale}
        x={stage.x}
        y={stage.y}
        draggable
      >
        <Layer>
          {uniqueSpecies.map((species, speciesIndex) => {
            const speciesData = referenceData.filter(d => d.species_name === species);
            return (
              <React.Fragment key={species}>
                <Text text={species} x={10} y={speciesIndex * speciesSpacing + 50} fontSize={16} />
                {speciesData.map((chr) => {
                  const pos = chromosomePositions[`${chr.species_name}:${chr.chr_id}`];
                  if (!pos) {
                    return null;
                  }
                  const { x, y } = pos;
                  const width = xScale(chr.chr_size_bp);
                  return (
                    <Group
                      key={chr.chr_id}
                      x={x}
                      y={y}
                      draggable
                      onDragMove={e => {
                        const newPositions = { ...chromosomePositions };
                        newPositions[`${chr.species_name}:${chr.chr_id}`] = { x: e.target.x(), y: e.target.y() };
                        setChromosomePositions(newPositions);
                      }}
                    >
                      <Shape
                        sceneFunc={(context, shape) => {
                          const radius = 10;
                          context.beginPath();
                          context.moveTo(radius, 0);
                          if (chr.centromere_start && chr.centromere_end) {
                            const centromereStart = xScale(chr.centromere_start);
                            const centromereEnd = xScale(chr.centromere_end);
                            context.lineTo(centromereStart, 0);
                            context.lineTo(centromereStart + (centromereEnd - centromereStart) / 2, 5);
                            context.lineTo(centromereEnd, 0);
                          }
                          context.lineTo(width - radius, 0);
                          context.quadraticCurveTo(width, 0, width, radius);
                          context.lineTo(width, chromosomeHeight - radius);
                          context.quadraticCurveTo(width, chromosomeHeight, width - radius, chromosomeHeight);
                          if (chr.centromere_start && chr.centromere_end) {
                            const centromereStart = xScale(chr.centromere_start);
                            const centromereEnd = xScale(chr.centromere_end);
                            context.lineTo(centromereEnd, chromosomeHeight);
                            context.lineTo(centromereStart + (centromereEnd - centromereStart) / 2, chromosomeHeight - 5);
                            context.lineTo(centromereStart, chromosomeHeight);
                          }
                          context.lineTo(radius, chromosomeHeight);
                          context.quadraticCurveTo(0, chromosomeHeight, 0, chromosomeHeight - radius);
                          context.lineTo(0, radius);
                          context.quadraticCurveTo(0, 0, radius, 0);
                          context.closePath();
                          context.fillStrokeShape(shape);
                        }}
                        fill={speciesColorScale(species)}
                        stroke="black"
                        strokeWidth={1}
                        onMouseEnter={e => {
                          const stage = e.target.getStage();
                          setTooltip({
                            x: e.target.x() + e.target.width() / 2,
                            y: e.target.y() - 10,
                            text: `${chr.species_name}: ${chr.chr_id}`,
                            visible: true,
                          });
                        }}
                        onMouseLeave={() => {
                          setTooltip(prev => ({ ...prev, visible: false }));
                        }}
                      />
                      <Text
                        text={chr.chr_id}
                        x={0}
                        y={-15}
                        fontSize={12}
                        fill="black"
                        align="center"
                        width={width}
                      />
                    </Group>
                  );
                })}
              </React.Fragment>
            );
          })}
          {filteredSyntenyData.map((link, i) => {
            const sourcePos = getChromosomePosition(link.ref_chr, link.ref_species);
            const targetPos = getChromosomePosition(link.query_chr, link.query_name);

            if (!sourcePos || !targetPos) {
              return null;
            }

            const sourceX = sourcePos.x + xScale(link.ref_start);
            const targetX = targetPos.x + xScale(link.query_start);
            const sourceWidth = xScale(link.ref_end - link.ref_start);
            const targetWidth = xScale(link.query_end - link.query_start);

            return (
              <Group key={i}>
                <Rect
                  x={sourceX}
                  y={sourcePos.y}
                  width={sourceWidth}
                  height={chromosomeHeight}
                  fill={link.query_strand === '+' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(220, 38, 38, 0.1)'}
                  stroke={link.query_strand === '+' ? '#2563eb' : '#dc2626'}
                  strokeWidth={1}
                />
                <Rect
                  x={targetX}
                  y={targetPos.y}
                  width={targetWidth}
                  height={chromosomeHeight}
                  fill={link.query_strand === '+' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(220, 38, 38, 0.1)'}
                  stroke={link.query_strand === '+' ? '#2563eb' : '#dc2626'}
                  strokeWidth={1}
                />
                <Shape
                  sceneFunc={(context, shape) => {
                    const sourceY = sourcePos.y > targetPos.y ? sourcePos.y : sourcePos.y + chromosomeHeight;
                    const targetY = sourcePos.y > targetPos.y ? targetPos.y + chromosomeHeight : targetPos.y;
                    context.beginPath();
                    context.moveTo(sourceX, sourceY);
                    context.bezierCurveTo(
                      sourceX,
                      (sourceY + targetY) / 2,
                      targetX,
                      (sourceY + targetY) / 2,
                      targetX,
                      targetY
                    );
                    context.lineTo(targetX + targetWidth, targetY);
                    context.bezierCurveTo(
                      targetX + targetWidth,
                      (sourceY + targetY) / 2,
                      sourceX + sourceWidth,
                      (sourceY + targetY) / 2,
                      sourceX + sourceWidth,
                      sourceY
                    );
                    context.closePath();
                    context.fillStrokeShape(shape);
                  }}
                  fillLinearGradientStartPoint={{ x: sourceX, y: sourcePos.y }}
                  fillLinearGradientEndPoint={{ x: targetX, y: targetPos.y }}
                  fillLinearGradientColorStops={[0, speciesColorScale(link.query_name), 1, speciesColorScale(link.ref_species)]}
                  stroke={link.query_strand === '+' ? '#2563eb' : '#dc2626'}
                  strokeWidth={0.5}
                  opacity={0.7}
                  onMouseEnter={e => {
                    const stage = e.target.getStage();
                    setTooltip({
                      x: stage!.getPointerPosition()!.x / stage!.scaleX() - stage!.x() / stage!.scaleX(),
                      y: stage!.getPointerPosition()!.y / stage!.scaleY() - stage!.y() / stage!.scaleY() - 10,
                      text: `Synteny: ${link.ref_chr} -> ${link.query_chr}`,
                      visible: true,
                    });
                  }}
                  onMouseLeave={() => {
                    setTooltip(prev => ({ ...prev, visible: false }));
                  }}
                />
              </Group>
            );
          })}
          {tooltip.visible && (
            <Text
              x={tooltip.x}
              y={tooltip.y}
              text={tooltip.text}
              fontSize={12}
              fill="black"
              padding={5}
              listening={false}
              perfectDrawEnabled={false}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};
