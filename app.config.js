export default {
  "expo": {
    "name": "EduSign",
    "scheme": "edusign",
    "slug": "edusign",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/adaptive-icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/adaptive-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#0d111a"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "androidStatusBar": {
      "backgroundColor": "#0d111a"
    },
    "android": {
      "googleServicesFile": "./google-services.json",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#161718"
      },
      "package": "com.torusplatforms.torus",
      "versionCode": 29
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "owner": "edusign",
    "newArchEnabled": true
  }
}
