# Pomotime - JavaFX Port (preview)

This repository contains a JavaFX port of the Pomotime app.

Build & run (requires Java 17+ and Gradle):
1. ./gradlew run
2. Or build a jar: ./gradlew shadowJar (plug-in needed)

Notes:
- Main entry: com.example.pomotime.MainApp
- Timer logic: src/main/java/com/example/pomotime/PomodoroTimer.java
- This is a minimal runnable prototype. We will add settings persistence, audio notifications, and packaging once you confirm.