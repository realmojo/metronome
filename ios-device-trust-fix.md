# iOS 기기 신뢰 문제 해결 방법

## 문제
iOS 기기에서 앱을 실행하려고 할 때 "Untrusted Developer" 또는 신뢰 문제가 발생하는 경우

## 해결 방법

### 방법 1: 기기에서 직접 신뢰 설정 (가장 일반적)

1. **iPhone/iPad에서:**
   - 설정(Settings) 앱 열기
   - 일반(General) → VPN 및 기기 관리(VPN & Device Management)
   - 또는 일반(General) → 기기 관리(Device Management) 또는 프로파일 및 기기 관리(Profiles & Device Management)
   
2. **개발자 앱 섹션 찾기:**
   - "개발자 앱"(Developer App) 또는 "엔터프라이즈 앱"(Enterprise App) 섹션 확인
   - 또는 "신뢰할 수 없는 개발자"(Untrusted Developer) 섹션 확인
   
3. **개발자 계정 선택:**
   - 개발자 이름(예: "Apple Development: your@email.com" 또는 "Mojoday") 클릭
   
4. **신뢰 버튼 클릭:**
   - "신뢰 [개발자 이름]"(Trust [Developer Name]) 버튼 클릭
   - 확인 팝업에서 "신뢰"(Trust) 선택

5. **앱 다시 실행:**
   - 홈 화면으로 돌아가서 앱 실행

### 방법 2: Xcode에서 자동 신뢰 설정

1. **Xcode 열기**
   ```bash
   open ios/app.xcworkspace
   ```

2. **Signing & Capabilities 확인:**
   - 프로젝트 네비게이터에서 프로젝트 선택
   - 타겟(Target) 선택
   - Signing & Capabilities 탭
   - Team: Mojoday (또는 개발자 계정) 선택
   - Automatically manage signing 체크

3. **기기에서 실행:**
   - 상단에서 실제 기기 선택
   - Product → Run (Cmd+R)
   - Xcode가 자동으로 프로비저닝 프로파일 설치

### 방법 3: 프로비저닝 프로파일 수동 설치

1. **Xcode에서 프로파일 다운로드:**
   - Xcode → Preferences → Accounts
   - 개발자 계정 선택
   - Download Manual Profiles 클릭

2. **기기에 설치:**
   - 기기를 Mac에 연결
   - Xcode → Window → Devices and Simulators
   - 기기 선택 → 프로파일 탭에서 설치

### 방법 4: 개발자 계정 확인

**Apple Developer 계정이 필요한 경우:**
- 무료 계정: Apple ID로 등록 가능 (7일 제한)
- 유료 계정: $99/년 (연간 갱신 필요)

**계정 확인:**
```bash
# Xcode에서 확인
# Xcode → Preferences → Accounts
```

### 방법 5: 완전히 재설치

1. **기기에서 앱 삭제**
   - 홈 화면에서 앱 길게 누르기
   - 삭제 선택

2. **신뢰 설정 초기화**
   - 설정 → 일반 → VPN 및 기기 관리
   - 모든 프로파일 삭제

3. **Xcode에서 다시 빌드 및 설치**
   ```bash
   npx expo prebuild --platform ios --clean
   open ios/app.xcworkspace
   ```
   - Xcode에서 Product → Clean Build Folder (Shift+Cmd+K)
   - Product → Run

## 빠른 체크리스트

1. ✅ 기기가 Mac과 USB로 연결되어 있나요? (또는 같은 Wi-Fi)
2. ✅ 설정 → 일반 → VPN 및 기기 관리에서 개발자 계정을 신뢰했나요?
3. ✅ Xcode에서 Signing & Capabilities에 Team이 설정되어 있나요?
4. ✅ 개발자 계정이 유효한가요? (무료 계정은 7일 제한)
5. ✅ 앱을 삭제하고 다시 설치했나요?

## 일반적인 오류 메시지

- "Untrusted Developer" → 방법 1 참고
- "Developer Mode is not enabled" → 설정 → 개인 정보 보호 및 보안 → 개발자 모드 활성화
- "No code signing found" → Xcode에서 Signing & Capabilities 확인

## 참고

- 무료 Apple Developer 계정은 7일마다 앱을 다시 설치해야 합니다
- 유료 계정($99/년)은 이 제한이 없습니다
- TestFlight을 사용하면 신뢰 문제 없이 배포할 수 있습니다

