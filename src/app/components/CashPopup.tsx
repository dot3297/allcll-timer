/**
 * CashPopup — 캐시·업적 안내 팝업
 *
 * ## 개요
 * 타이머 화면의 캐시 버튼을 탭했을 때 표시되는 팝업 컴포넌트.
 * 업적 시스템과 캐시 획득 방법을 사용자에게 안내한다.
 *
 * ## 주요 기능
 * - "업적이 뭐예요?" 섹션: 업적 시스템 설명 표시
 * - "캐시는 어떻게 얻나요?" 섹션: 캐시 획득 방법 안내
 * - "내 캐시 히스토리" 버튼: CashHistoryScreen으로 진입
 */
import svgPaths from "../../imports/타이머캐시버튼선택시/svg-rmz1bamu8z";

function Frame27() {
  return (
    <div className="[word-break:break-word] flex flex-col font-['Pretendard:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white w-full">
      <p className="leading-[24px]">업적이 뭐예요?</p>
    </div>
  );
}

function Frame16() {
  return (
    <div className="bg-[var(--color-bg-muted)] relative rounded-[12px] shrink-0 w-full">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col gap-[4px] items-center justify-center p-[16px] relative size-full">
          <Frame27 />
          <div className="[word-break:break-word] flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[var(--color-fg-text-subtle)] text-[14px] w-full">
            <ul>
              <li className="list-disc ms-[21px]">
                <span className="leading-[21px]">허용 앱 OFF 타이머를 사용하면 업적 포인트가 쌓여요.</span>
              </li>
            </ul>
          </div>
          <div className="[word-break:break-word] flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[var(--color-fg-text-subtle)] text-[14px] w-full">
            <ul>
              <li className="list-disc ms-[21px]">
                <span className="leading-[21px]">타이머를 10분 집중할 때마다 업적 10점 획득!</span>
              </li>
            </ul>
          </div>
          <div className="[word-break:break-word] flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[var(--color-fg-text-subtle)] text-[14px] w-full">
            <ul>
              <li className="list-disc ms-[21px] whitespace-pre-wrap">
                <span className="leading-[21px]">
                  {`업적은 제한 없이 계속 모을 수 있고, 열심히 `}
                  <br aria-hidden="true" />
                  사용할수록 나의 성장 기록이 쌓여요.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame26() {
  return (
    <div className="[word-break:break-word] flex flex-col font-['Pretendard:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white w-full">
      <p className="leading-[24px]">캐시는 어떻게 얻나요?</p>
    </div>
  );
}

function CashHistoryButton({ onCashHistory }: { onCashHistory?: () => void }) {
  return (
    <div className="w-full flex justify-start">
      <button
        type="button"
        onClick={onCashHistory}
        className="flex items-center gap-[2px] px-[8px] py-[4px] rounded-[4px] active:bg-white/10 transition-colors"
      >
        <p className="font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-[var(--color-fg-text-muted)] whitespace-nowrap">
          내 캐시 히스토리
        </p>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M4.5 9L7.5 6L4.5 3"
            stroke="var(--color-fg-text-muted)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

function Frame18({ onCashHistory }: { onCashHistory?: () => void }) {
  return (
    <div className="bg-[var(--color-bg-muted)] relative rounded-[12px] shrink-0 w-full">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col gap-[4px] items-center justify-center p-[16px] relative size-full">
          <Frame26 />
          <div className="[word-break:break-word] flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[var(--color-fg-text-subtle)] text-[14px] w-full">
            <ul>
              <li className="list-disc ms-[21px]">
                <span className="leading-[21px]">업적을 모으면 일부가 캐시로 전환돼요.</span>
              </li>
            </ul>
          </div>
          <div className="[word-break:break-word] flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[var(--color-fg-text-subtle)] text-[14px] w-full">
            <ul>
              <li className="list-disc ms-[21px]">
                <span className="leading-[21px]">적립된 캐시는 2년 동안 사용 가능하며, 올클 스토어에서 상품 구매 시 사용할 수 있어요.</span>
              </li>
            </ul>
          </div>
          <CashHistoryButton onCashHistory={onCashHistory} />
        </div>
      </div>
    </div>
  );
}

function Frame25({ onCashHistory }: { onCashHistory?: () => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <div className="[word-break:break-word] flex flex-col font-['Pretendard:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-white w-full">
        <p className="leading-[27px]">업적과 캐시가 궁금해요</p>
      </div>
      <Frame16 />
      <Frame18 onCashHistory={onCashHistory} />
    </div>
  );
}

function Title({ onCashHistory }: { onCashHistory?: () => void }) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="title">
      <Frame25 onCashHistory={onCashHistory} />
    </div>
  );
}

function Content3() {
  return (
    <div className="content-stretch flex gap-[4.082px] items-center relative shrink-0" data-name="content">
      <div className="[word-break:break-word] flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14.29px] text-center text-white whitespace-nowrap">
        <p className="leading-[21.429px]">확인 했어요</p>
      </div>
    </div>
  );
}

function Container({ onClose, onCashHistory }: { onClose: () => void; onCashHistory?: () => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[32.653px] items-start relative shrink-0 w-full" data-name="container">
      <Title onCashHistory={onCashHistory} />
      <div className="content-stretch flex gap-[8.163px] items-center relative shrink-0 w-full" data-name="Buttom group">
        <button
          onClick={onClose}
          className="bg-[var(--color-bg-brand)] flex-[1_0_0] h-[44.898px] min-w-px relative rounded-[8.163px] cursor-pointer active:bg-[var(--color-bg-brand-pressed)] transition-colors"
        >
          <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex items-center justify-center px-[16.327px] py-[12.245px] relative size-full">
              <Content3 />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

export default function CashPopup({
  onClose,
  onCashHistory,
}: {
  onClose: () => void;
  onCashHistory?: () => void;
}) {
  return (
    <>
      {/* 딤드 배경 */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* 팝업 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-bg-weak)] content-stretch flex flex-col gap-[16px] items-center w-[min(350px,calc(100vw-32px))] overflow-clip p-[24px] rounded-[16px] z-50">
        <Container onClose={onClose} onCashHistory={onCashHistory} />
      </div>
    </>
  );
}
