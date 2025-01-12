/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PixiComponent, useApp } from '@pixi/react';
import { Viewport, type IViewportOptions } from 'pixi-viewport';
import { Application } from 'pixi.js';
import { ReactNode, forwardRef } from 'react';
import { findChildrenByName } from './recursive-container-search';

export const updateScaledObjects = (viewport: Viewport) => {
  const preservedScaleObjects = findChildrenByName({
    container: viewport,
    nameSubstring: 'PRESERVE_SCALE',
  });

  for (let i = 0; i < preservedScaleObjects.length; i++) {
    const element = preservedScaleObjects[i];
    const scaleFactor = element['scaleFactor'] ?? 1;
    element.scale.y = scaleFactor / viewport.scale.y;
    element.scale.x = scaleFactor / viewport.scale.x;
  }
};

type CustomViewportOptions = {
  size: { width: number; height: number };
  children: ReactNode;
  initialZoom?: number;
  minScale?: number;
  maxScale?: number;
};

// we share the ticker and interaction from app
const PixiViewportComponent = PixiComponent('Viewport', {
  create(
    props: {
      app: Application;
    } & Partial<IViewportOptions> &
      CustomViewportOptions
  ) {
    const { app, ...viewportProps } = props;

    console.log(app.renderer);

    const viewport = new Viewport({
      ticker: props.app.ticker,
      events: props.app.renderer.events,
      ...viewportProps,
    });

    if (props.worldHeight && props.worldWidth) {
      viewport
        .drag()
        .decelerate()
        .pinch()
        .wheel({ trackpadPinch: true, wheelZoom: true })
        .clampZoom({
          minScale: props?.minScale ?? 0.025,
          maxScale: props?.maxScale ?? 3,
        });
    }

    if (props.initialZoom) {
      viewport.setZoom(props.initialZoom, true);
    }
    updateScaledObjects(viewport);

    viewport.on('zoomed', () => {
      updateScaledObjects(viewport);
    });
    viewport.on('snap-zoom-end', () => {
      updateScaledObjects(viewport);
    });

    viewport.sortableChildren = true;

    return viewport;
  },
  applyProps(viewport, _oldProps, _newProps) {
    const { children: oldChildren, ...oldProps } = _oldProps;
    const { children: newChildren, ...newProps } = _newProps;

    Object.keys(newProps).forEach((p) => {
      // @ts-ignore
      if (oldProps[p] !== newProps[p]) {
        // @ts-ignore
        viewport[p] = newProps[p];
      }
    });

    viewport.moveCenter(newProps.worldWidth / 2, newProps.worldHeight / 2);
  },
  didMount() {
    //
  },
  config: {
    destroy: false,
  },
});

// create a component that can be consumed
// that automatically pass down the app
export const PixiViewport = forwardRef<
  Viewport,
  Partial<IViewportOptions> & {
    children: ReactNode;
  } & CustomViewportOptions
>((props, ref) => (
  <PixiViewportComponent ref={ref} app={useApp()} {...props} />
));

PixiViewport.displayName = 'PixiViewport';
