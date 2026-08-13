"use client";

import { useEffect } from "react";

/** 글 열람 시 조회수 1 증가. 세션당 글마다 1회만. */
export default function ViewBeacon({ id }: { id: number }) {
  useEffect(() => {
    const key = `v:${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* 시크릿 모드 등 — 그냥 집계 */
    }
    fetch(`/api/view/${id}`, { method: "POST" }).catch(() => {});
  }, [id]);
  return null;
}
