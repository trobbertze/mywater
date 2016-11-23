rm platforms/android/build/outputs/apk/my_water_armv7.apk
rm platforms/android/build/outputs/apk/my_water_x86.apk
ionic build --release android
cd platforms/android/build/outputs/apk/
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../../../../../release-key.keystore android-armv7-release-unsigned.apk my_water
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../../../../../release-key.keystore android-x86-release-unsigned.apk my_water
~/Library/Android/sdk/build-tools/24.0.3/zipalign -v 4 android-armv7-release-unsigned.apk my_water_armv7.apk
~/Library/Android/sdk/build-tools/24.0.3/zipalign -v 4 android-x86-release-unsigned.apk my_water_x86.apk
