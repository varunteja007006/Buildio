import type {
  Announcements,
  ScreenReaderInstructions,
  UniqueIdentifier,
} from "@dnd-kit/core";

export type SortableOrientation = "vertical" | "horizontal" | "mixed";

export function createSortableAnnouncements(
  value: UniqueIdentifier[],
): Announcements {
  return {
    onDragStart({ active }) {
      const activeValue = active.id.toString();
      return `Grabbed sortable item "${activeValue}". Current position is ${active.data.current?.sortable.index + 1} of ${value.length}. Use arrow keys to move, space to drop.`;
    },
    onDragOver({ active, over }) {
      if (over) {
        const overIndex = over.data.current?.sortable.index ?? 0;
        const activeIndex = active.data.current?.sortable.index ?? 0;
        const moveDirection = overIndex > activeIndex ? "down" : "up";
        const activeValue = active.id.toString();
        return `Sortable item "${activeValue}" moved ${moveDirection} to position ${overIndex + 1} of ${value.length}.`;
      }
      return "Sortable item is no longer over a droppable area. Press escape to cancel.";
    },
    onDragEnd({ active, over }) {
      const activeValue = active.id.toString();
      if (over) {
        const overIndex = over.data.current?.sortable.index ?? 0;
        return `Sortable item "${activeValue}" dropped at position ${overIndex + 1} of ${value.length}.`;
      }
      return `Sortable item "${activeValue}" dropped. No changes were made.`;
    },
    onDragCancel({ active }) {
      const activeIndex = active.data.current?.sortable.index ?? 0;
      const activeValue = active.id.toString();
      return `Sorting cancelled. Sortable item "${activeValue}" returned to position ${activeIndex + 1} of ${value.length}.`;
    },
    onDragMove({ active, over }) {
      if (over) {
        const overIndex = over.data.current?.sortable.index ?? 0;
        const activeIndex = active.data.current?.sortable.index ?? 0;
        const moveDirection = overIndex > activeIndex ? "down" : "up";
        const activeValue = active.id.toString();
        return `Sortable item "${activeValue}" is moving ${moveDirection} to position ${overIndex + 1} of ${value.length}.`;
      }
      return "Sortable item is no longer over a droppable area. Press escape to cancel.";
    },
  };
}

export function createSortableScreenReaderInstructions(
  orientation: SortableOrientation,
): ScreenReaderInstructions {
  return {
    draggable: `
      To pick up a sortable item, press space or enter.
      While dragging, use the ${orientation === "vertical" ? "up and down" : orientation === "horizontal" ? "left and right" : "arrow"} keys to move the item.
      Press space or enter again to drop the item in its new position, or press escape to cancel.
    `,
  };
}
