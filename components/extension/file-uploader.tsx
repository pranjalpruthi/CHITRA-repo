"use client";

import * as React from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import { cn } from "@/lib/utils";

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: File[] | null;
  onValueChange?: (files: File[] | null) => void;
  dropzoneOptions?: DropzoneOptions;
}

interface FileInputProps extends React.HTMLAttributes<HTMLDivElement> {}

interface FileUploaderContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface FileUploaderItemProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
}

export function FileUploader({
  value,
  onValueChange,
  dropzoneOptions,
  className,
  children,
  ...props
}: FileUploaderProps) {
  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      onValueChange?.(acceptedFiles);
    },
    [onValueChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    ...dropzoneOptions,
    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative",
        isDragActive && "ring-2 ring-primary ring-offset-2",
        className
      )}
      {...props}
    >
      <input {...getInputProps()} />
      {children}
    </div>
  );
}

export function FileInput({ className, children, ...props }: FileInputProps) {
  return (
    <div
      className={cn(
        "w-full rounded-lg cursor-pointer transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FileUploaderContent({
  className,
  children,
  ...props
}: FileUploaderContentProps) {
  return (
    <div
      className={cn("mt-2 space-y-1", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function FileUploaderItem({
  index,
  className,
  children,
  ...props
}: FileUploaderItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}