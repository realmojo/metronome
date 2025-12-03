# iOS 실제 기기에서 앱 실행하기

## "No script URL provided" 오류 해결

### 방법 1: 개발 서버 먼저 시작 (권장)

**터미널 1: 개발 서버 시작**
```bash
npx expo start --localhost
```

**터미널 2: 기기에 설치**
```bash
EXPO_NO_WATCHMAN=1 npx expo run:ios --device
```

### 방법 2: 컴퓨터 IP 주소 사용

**1. 컴퓨터의 로컬 IP 주소 확인**
```bash
# macOS
ifconfig | grep "inet " | grep -v 127.0.0.1

# 또는
ipconfig getifaddr en0
```

**2. 개발 서버 시작 (IP 주소 지정)**
```bash
# 예: IP가 192.168.1.100인 경우
EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 npx expo start --host tunnel
```

**3. 기기와 컴퓨터가 같은 Wi-Fi에 연결되어 있는지 확인**

### 방법 3: 터널 모드 사용 (가장 안정적)

**터미널 1: 터널 모드로 개발 서버 시작**
```bash
npx expo start --tunnel
```

**터미널 2: 기기에 설치**
```bash
EXPO_NO_WATCHMAN=1 npx expo run:ios --device
```

### 방법 4: Xcode에서 직접 실행 (개발 서버 불필요)

**1. Prebuild 실행**
```bash
npx expo prebuild --platform ios
```

**2. Xcode 열기**
```bash
open ios/app.xcworkspace
```

**3. Xcode에서:**
- 상단에서 실제 기기 선택
- `Product` → `Run` (또는 `Cmd+R`)
- **주의**: 이 방법은 개발 서버 없이 실행되므로, 코드 변경 시 다시 빌드해야 합니다

### 방법 5: 환경 변수 설정

```bash
# 모든 환경 변수 설정
EXPO_NO_WATCHMAN=1 \
EXPO_NO_DOTENV=1 \
EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 \
npx expo start --tunnel

# 다른 터미널에서
EXPO_NO_WATCHMAN=1 npx expo run:ios --device
```

## 네트워크 문제 해결

### 같은 Wi-Fi 확인
- iPhone과 Mac이 같은 Wi-Fi 네트워크에 연결되어 있어야 합니다
- 회사/학교 Wi-Fi는 기기 간 통신을 차단할 수 있습니다

### 방화벽 확인
- Mac의 방화벽이 8081 포트를 차단하지 않는지 확인
- 시스템 설정 → 보안 및 개인 정보 보호 → 방화벽

### 포트 확인
```bash
# 8081 포트 사용 중인 프로세스 확인
lsof -ti:8081

# 종료
kill -9 $(lsof -ti:8081)
```

## 빠른 체크리스트

1. ✅ 개발 서버가 실행 중인가요? (`npx expo start`)
2. ✅ iPhone과 Mac이 같은 Wi-Fi에 연결되어 있나요?
3. ✅ 방화벽이 8081 포트를 차단하지 않나요?
4. ✅ 기기에 신뢰할 수 있는 개발자로 등록되어 있나요? (설정 → 일반 → VPN 및 기기 관리)

## 가장 확실한 방법

```bash
# 터미널 1
npx expo start --tunnel --clear

# 터미널 2 (잠시 후)
EXPO_NO_WATCHMAN=1 npx expo run:ios --device
```

터널 모드는 네트워크 설정과 관계없이 작동합니다!

