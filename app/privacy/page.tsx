import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/db";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description:
    "이거닷의 개인정보처리방침입니다. 수집하는 정보, 쿠키 및 광고 관련 안내를 확인하실 수 있습니다.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <div className="crumb">
        <Link href="/">전체 게시판 ›</Link>
      </div>
      <div className="post-hd">
        <h1>개인정보처리방침</h1>
        <div className="post-meta">
          <span>시행일: 2026년 8월 13일</span>
        </div>
      </div>
      <div className="post-body">
        <h2>1. 개요</h2>
        <p>
          이거닷(이하 &ldquo;본 사이트&rdquo;)은 이용자의 개인정보를 소중히
          여기며 관련 법령을 준수합니다. 본 방침은 본 사이트가 어떤 정보를
          수집하고 어떻게 이용하는지 안내합니다.
        </p>

        <h2>2. 수집하는 개인정보</h2>
        <p>
          본 사이트는 회원가입, 댓글, 문의 양식 등 이용자가 직접 개인정보를
          입력하는 기능을 제공하지 않으며, 이름·이메일·연락처 등 개인을 식별할
          수 있는 정보를 직접 수집하지 않습니다.
        </p>
        <p>
          서비스 운영 과정에서 다음 정보가 자동으로 수집될 수 있습니다. 이
          정보는 개인을 식별하는 데 사용되지 않습니다.
        </p>
        <p>
          · 접속 기록(IP 주소, 브라우저 종류, 접속 일시) — 호스팅 사업자
          (Vercel)의 표준 로그
          <br />· 글 조회수 집계 — 개인 식별 정보 없이 페이지 단위로만 집계
          <br />· 브라우저 세션 저장소 — 같은 글의 조회수 중복 집계를 막기 위한
          용도로만 사용
        </p>

        <h2>3. 쿠키 및 광고</h2>
        <p>
          본 사이트는 Google AdSense 등 제3자 광고 서비스를 게재할 수 있습니다.
          광고 사업자는 쿠키를 사용하여 이용자의 이전 방문 기록에 기반한 맞춤형
          광고를 제공할 수 있습니다. 이용자는{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google 광고 설정
          </a>
          에서 맞춤형 광고를 해제할 수 있으며, 브라우저 설정을 통해 쿠키 저장을
          거부할 수 있습니다.
        </p>

        <h2>4. 통계 도구</h2>
        <p>
          서비스 개선을 위해 방문 통계 도구(예: Google Analytics)를 사용할 수
          있습니다. 통계 도구가 수집하는 정보는 익명화된 형태로 처리되며, 개인을
          식별하는 데 사용되지 않습니다.
        </p>

        <h2>5. 개인정보의 제3자 제공</h2>
        <p>
          본 사이트는 이용자의 개인정보를 직접 수집하지 않으므로 제3자에게
          제공하는 개인정보도 없습니다. 다만 위 2·3항의 자동 수집 정보는 각
          서비스 제공자(호스팅·광고·통계)의 개인정보처리방침에 따라 처리됩니다.
        </p>

        <h2>6. 이용자의 권리</h2>
        <p>
          이용자는 언제든지 쿠키 저장 거부, 맞춤형 광고 해제 등을 통해 자동
          수집을 제한할 수 있습니다. 이 경우에도 사이트 열람에는 제한이
          없습니다.
        </p>

        <h2>7. 방침의 변경</h2>
        <p>
          본 방침이 변경되는 경우 이 페이지를 통해 공지하며, 변경된 방침은
          게시한 날부터 효력이 발생합니다.
        </p>
      </div>
    </>
  );
}
