"use client";

import {
  DndContext,
  type DndContextProps,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  closestCenter,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  type SortableContextProps,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import * as React from "react";

import {
  type SortableOrientation,
  createSortableAnnouncements,
  createSortableScreenReaderInstructions,
} from "@workspace/ui/components/sortable-accessibility";
import {
  type SortableRootContextValue,
  SortableRootContext,
} from "@workspace/ui/components/sortable-context";

const orientationConfig = {
  vertical: {
    modifiers: [restrictToVerticalAxis, restrictToParentElement],
    strategy: verticalListSortingStrategy,
    collisionDetection: closestCenter,
  },
  horizontal: {
    modifiers: [restrictToHorizontalAxis, restrictToParentElement],
    strategy: horizontalListSortingStrategy,
    collisionDetection: closestCenter,
  },
  mixed: {
    modifiers: [restrictToParentElement],
    strategy: undefined,
    collisionDetection: closestCorners,
  },
};

interface GetItemValue<T> {
  /**
   * Callback that returns a unique identifier for each sortable item. Required for array of objects.
   * @example getItemValue={(item) => item.id}
   */
  getItemValue: (item: T) => UniqueIdentifier;
}

type SortableRootProps<T> = DndContextProps &
  (T extends object ? GetItemValue<T> : Partial<GetItemValue<T>>) & {
    value: T[];
    onValueChange?: (items: T[]) => void;
    onMove?: (
      event: DragEndEvent & { activeIndex: number; overIndex: number },
    ) => void;
    strategy?: SortableContextProps["strategy"];
    orientation?: SortableOrientation;
    flatCursor?: boolean;
  };

function SortableRoot<T>(props: SortableRootProps<T>) {
  const {
    value,
    onValueChange,
    collisionDetection,
    modifiers,
    strategy,
    onMove,
    orientation = "vertical",
    flatCursor = false,
    getItemValue: getItemValueProp,
    accessibility,
    onDragStart: onDragStartProp,
    onDragEnd: onDragEndProp,
    onDragCancel: onDragCancelProp,
    ...sortableProps
  } = props;

  const id = React.useId();
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const config = React.useMemo(
    () => orientationConfig[orientation],
    [orientation],
  );

  const getItemValue = React.useCallback(
    (item: T): UniqueIdentifier => {
      if (typeof item === "object" && !getItemValueProp) {
        throw new Error("getItemValue is required when using array of objects");
      }
      return getItemValueProp
        ? getItemValueProp(item)
        : (item as UniqueIdentifier);
    },
    [getItemValueProp],
  );

  const items = React.useMemo(() => {
    return value.map((item) => getItemValue(item));
  }, [value, getItemValue]);

  const onDragStart = React.useCallback(
    (event: DragStartEvent) => {
      onDragStartProp?.(event);

      if (event.activatorEvent.defaultPrevented) return;

      setActiveId(event.active.id);
    },
    [onDragStartProp],
  );

  const onDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      onDragEndProp?.(event);

      if (event.activatorEvent.defaultPrevented) return;

      const { active, over } = event;
      if (over && active.id !== over?.id) {
        const activeIndex = value.findIndex(
          (item) => getItemValue(item) === active.id,
        );
        const overIndex = value.findIndex(
          (item) => getItemValue(item) === over.id,
        );

        if (onMove) {
          onMove({ ...event, activeIndex, overIndex });
        } else {
          onValueChange?.(arrayMove(value, activeIndex, overIndex));
        }
      }
      setActiveId(null);
    },
    [value, onValueChange, onMove, getItemValue, onDragEndProp],
  );

  const onDragCancel = React.useCallback(
    (event: DragEndEvent) => {
      onDragCancelProp?.(event);

      if (event.activatorEvent.defaultPrevented) return;

      setActiveId(null);
    },
    [onDragCancelProp],
  );

  const announcements = React.useMemo(
    () => createSortableAnnouncements(items),
    [items],
  );

  const screenReaderInstructions = React.useMemo(
    () => createSortableScreenReaderInstructions(orientation),
    [orientation],
  );

  const contextValue = React.useMemo(
    () => ({
      id,
      items,
      modifiers: modifiers ?? config.modifiers,
      strategy: strategy ?? config.strategy,
      activeId,
      setActiveId,
      getItemValue,
      flatCursor,
    }),
    [
      id,
      items,
      modifiers,
      strategy,
      config.modifiers,
      config.strategy,
      activeId,
      getItemValue,
      flatCursor,
    ],
  );

  return (
    <SortableRootContext.Provider
      value={contextValue as SortableRootContextValue<unknown>}
    >
      <DndContext
        collisionDetection={collisionDetection ?? config.collisionDetection}
        modifiers={modifiers ?? config.modifiers}
        sensors={sensors}
        {...sortableProps}
        id={id}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
        accessibility={{
          announcements,
          screenReaderInstructions,
          ...accessibility,
        }}
      />
    </SortableRootContext.Provider>
  );
}

export { SortableRoot };
