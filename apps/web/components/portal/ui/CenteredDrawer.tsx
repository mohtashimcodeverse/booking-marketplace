"use client";

import type { ReactNode } from "react";
import { Modal } from "@/components/portal/ui/Modal";

export function CenteredDrawer(props: {
  open: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      title={props.title}
      subtitle={props.subtitle}
      size="xl"
    >
      {props.children}
    </Modal>
  );
}
