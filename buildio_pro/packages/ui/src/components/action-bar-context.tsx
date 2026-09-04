"use client";

import * as React from "react";

import { Button } from "@workspace/ui/components/button";

export const ROOT_NAME = "ActionBar";
export const GROUP_NAME = "ActionBarGroup";
export const ITEM_NAME = "ActionBarItem";
export const CLOSE_NAME = "ActionBarClose";
export const SEPARATOR_NAME = "ActionBarSeparator";
export const ITEM_SELECT = "actionbar.itemSelect";
export const ENTRY_FOCUS = "actionbarFocusGroup.onEntryFocus";
export const EVENT_OPTIONS = { bubbles: false, cancelable: true };

export type Direction = "ltr" | "rtl";
export type Orientation = "horizontal" | "vertical";

export interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

export type ActionBarItemElement = React.ComponentRef<typeof Button>;

function focusFirst(
  candidates: React.RefObject<HTMLElement | null>[],
  preventScroll = false,
) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidateRef of candidates) {
    const candidate = candidateRef.current;
    if (!candidate) continue;
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}

function wrapArray<T>(array: T[], startIndex: number) {
  return array.map<T>(
    (_, index) => array[(startIndex + index) % array.length] as T,
  );
}

function getDirectionAwareKey(key: string, dir?: Direction) {
  if (dir !== "rtl") return key;
  return key === "ArrowLeft"
    ? "ArrowRight"
    : key === "ArrowRight"
      ? "ArrowLeft"
      : key;
}

export interface ItemData {
  id: string;
  ref: React.RefObject<ActionBarItemElement | null>;
  disabled: boolean;
}

interface ActionBarContextValue {
  onOpenChange?: (open: boolean) => void;
  dir: Direction;
  orientation: Orientation;
  loop: boolean;
}

const ActionBarContext = React.createContext<ActionBarContextValue | null>(
  null,
);

export function useActionBarContext(consumerName: string) {
  const context = React.useContext(ActionBarContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface FocusContextValue {
  tabStopId: string | null;
  onItemFocus: (tabStopId: string) => void;
  onItemShiftTab: () => void;
  onFocusableItemAdd: () => void;
  onFocusableItemRemove: () => void;
  onItemRegister: (item: ItemData) => void;
  onItemUnregister: (id: string) => void;
  getItems: () => ItemData[];
}

const FocusContext = React.createContext<FocusContextValue | null>(null);

export function useFocusContext(consumerName: string) {
  const context = React.useContext(FocusContext);
  if (!context) {
    throw new Error(
      `\`${consumerName}\` must be used within \`FocusProvider\``,
    );
  }
  return context;
}

export {
  focusFirst,
  wrapArray,
  getDirectionAwareKey,
  ActionBarContext,
  FocusContext,
  type ActionBarContextValue,
  type FocusContextValue,
};
