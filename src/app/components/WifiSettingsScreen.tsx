/**
 * WifiSettingsScreen — OS 와이파이 설정 "목업" 화면 (Figma 7577-120119)
 *
 * 웹앱에서는 실제 OS 와이파이 설정을 열 수 없으므로(네이티브 API 부재),
 * 홈 화면 "온라인 모드" FAB → 이 화면(iOS 와이파이 스크린샷 풀스크린)으로 랜딩한다.
 * 좌상단 "< 설정" 위치에 뒤로가기 영역을 덧대 앱으로 복귀한다.
 */
import wifiImage from "../../imports/홈/wifi-settings.png";

export default function WifiSettingsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] bg-black" data-name="wifi-settings">
      <img
        src={wifiImage}
        alt="Wi-Fi 설정"
        className="w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />
      {/* 뒤로가기 — 이미지의 "‹ 설정" 위치에 투명 터치 영역 */}
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로"
        className="absolute top-[36px] left-0 w-[140px] h-[48px] active:opacity-40 transition-opacity"
        data-name="wifi-back"
      />
    </div>
  );
}
