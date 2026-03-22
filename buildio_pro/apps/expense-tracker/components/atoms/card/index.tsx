import React from "react";

export const SimpleCard = ({
  title,
  content,
}: {
  title: string;
  content: React.ReactNode;
}) => {
  return (
    <div className="bg-card p-4 shadow border rounded-lg">
      <div className="text-sm font-medium">{title}</div>
      <div>{content}</div>
    </div>
  );
};
