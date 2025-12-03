# InvalidHostID 오류 해결 방법

## 문제

`CommandError: InvalidHostID` 오류가 발생하는 경우

## 해결 방법

### 1. Expo 캐시 클리어

```bash
npx expo start --clear
```

### 2. 로컬호스트 모드로 실행

```bash
npx expo start --localhost
```

### 3. 터널 모드로 실행 (네트워크 문제 시)

```bash
npx expo start --tunnel
```

### 4. 포트 지정하여 실행

```bash
npx expo start --port 8081
```

### 5. Expo CLI 재설치

```bash
npm uninstall -g expo-cli
npm install -g @expo/cli
```

### 6. 네트워크 설정 확인

- 방화벽이 Expo 포트를 차단하지 않는지 확인
- VPN이 활성화되어 있으면 비활성화 후 시도

### 7. 환경 변수 설정

```bash
export EXPO_NO_DOTENV=1
npx expo start
```

### 8. 완전히 클린 시작

```bash
# Metro bundler 캐시 클리어
npx expo start --clear

# 또는
rm -rf .expo
rm -rf node_modules/.cache
npx expo start
```

## Android 빌드 시 (prebuild 사용 시)

만약 `expo prebuild` 명령어 실행 시 오류가 발생했다면:

```bash
# Android만 prebuild
npx expo prebuild --platform android --clean

# 또는 iOS만
npx expo prebuild --platform ios --clean
```

## iOS 기기 설치 시 InvalidHostID 오류

iOS 기기에 앱을 설치할 때 `InvalidHostID` 오류가 발생하는 경우:

### 방법 1: 개발 서버를 먼저 시작

```bash
# 터미널 1: 개발 서버 시작
npx expo start --localhost

# 터미널 2: 기기에 설치 (다른 터미널에서)
EXPO_NO_WATCHMAN=1 npx expo run:ios --device
```

### 방법 2: 환경 변수 사용

```bash
EXPO_NO_WATCHMAN=1 EXPO_NO_DOTENV=1 npx expo run:ios --device
```

### 방법 3: Xcode에서 직접 실행

```bash
# prebuild만 실행
npx expo prebuild --platform ios

# Xcode에서 직접 열기
open ios/app.xcworkspace

# Xcode에서:
# 1. 기기 선택
# 2. Product -> Run (또는 Cmd+R)
```

### 방법 4: 터널 모드 사용

```bash
# 개발 서버를 터널 모드로 시작
npx expo start --tunnel

# 다른 터미널에서
npx expo run:ios --device
```

## "No script URL provided" 오류 해결

이 오류는 앱이 JavaScript 번들을 찾을 수 없을 때 발생합니다.

### 개발 모드에서 발생하는 경우

**해결 방법 1: 개발 서버 먼저 시작**

```bash
# 터미널 1: 개발 서버 시작
npx expo start --localhost

# 터미널 2: 앱 실행 (다른 터미널에서)
# iOS 시뮬레이터
npx expo run:ios

# iOS 기기
npx expo run:ios --device

# Android
npx expo run:android
```

**해결 방법 2: 같은 명령어로 시작**

```bash
# 개발 서버와 앱을 함께 시작
npx expo start --ios
# 또는
npx expo start --android
```

**해결 방법 3: 포트 확인**

```bash
# 8081 포트가 사용 중인지 확인
lsof -ti:8081

# 포트가 사용 중이면 종료
kill -9 $(lsof -ti:8081)

# 다시 시작
npx expo start --clear
```

### 프로덕션 빌드에서 발생하는 경우

**Android:**

```bash
# JS 번들이 포함된 release 빌드 생성
cd android
./gradlew bundleRelease
```

**iOS:**

```bash
# Xcode에서 Archive 시 JS 번들이 자동으로 포함됩니다
# 또는 명시적으로 번들 생성
npx expo export
npx expo prebuild --platform ios
```

### 일반적인 해결 방법

1. **캐시 클리어**

```bash
npx expo start --clear
rm -rf .expo
rm -rf node_modules/.cache
```

2. **네트워크 확인**

- 같은 Wi-Fi 네트워크에 연결되어 있는지 확인
- 방화벽이 8081 포트를 차단하지 않는지 확인

3. **환경 변수 설정**

```bash
export EXPO_NO_DOTENV=1
npx expo start
```

## 참고

- `expo prebuild`는 네이티브 프로젝트를 생성하는 명령어이므로, 개발 서버를 시작할 필요가 없습니다
- 빌드만 필요한 경우: `cd android && ./gradlew bundleRelease`
- iOS 기기에서 실행할 때는 개발 서버가 실행 중이어야 합니다
- 프로덕션 빌드는 JS 번들이 앱 번들에 포함되어 있어야 합니다
