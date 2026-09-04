"use client";

import type {
  DndContextProps,
  DraggableAttributes,
  DraggableSyntheticListeners,
  UniqueIdentifier,
} from "@dnd-kit/core";
import type { SortableContextProps } from "@dnd-kit/sortable";
import * as React from "react";

export const ROOT_NAME = "Sortable";
export const CONTENT_NAME = "SortableContent";
export const ITEM_NAME = "SortableItem";
export const ITEM_HANDLE_NAME = "SortableItemHandle";
export const OVERLAY_NAME = "SortableOverlay";

export interface SortableRootContextValue<T> {
  id: string;
  items: UniqueIdentifier[];
  modifiers: DndContextProps["modifiers"];
  strategy: SortableContextProps["strategy"];
  activeId: UniqueIdentifier | null;
  setActiveId: (id: UniqueIdentifier | null) => void;
  getItemValue: (item: T) => UniqueIdentifier;
  flatCursor: boolean;
}

export const SortableRootContext =
  React.createContext<SortableRootContextValue<unknown> | null>(null);

export function useSortableContext(consumerName: string) {
  const context = React.useContext(SortableRootContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

export const SortableContentContext = React.createContext(false);

export const SortableOverlayContext = React.createContext(false);

export interface SortableItemContextValue {
  id: string;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners | undefined;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  isDragging?: boolean;
  disabled?: boolean;
}

export const SortableItemContext =
  React.createContext<SortableItemContextValue | null>(null);

export function useSortableItemContext(consumerName: string) {
  const context = React.useContext(SortableItemContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ITEM_NAME}\``);
  }
  return context;
}
