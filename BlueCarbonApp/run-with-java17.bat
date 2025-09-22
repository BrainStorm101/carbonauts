@echo off
echo Setting up Java 17 environment...
set JAVA_HOME=C:\Program Files\ojdkbuild\java-17-openjdk-17.0.3.0.6-1
set PATH=C:\Program Files\ojdkbuild\java-17-openjdk-17.0.3.0.6-1\bin;%PATH%

echo Java version:
java -version

echo.
echo Building React Native app...
npx react-native run-android

