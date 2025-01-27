export default {
  "expo": {
    "name": "EduSign",
    "scheme": "edusign",
    "slug": "edusign",
    "version": "1.0.3",
    "orientation": "portrait",
    "icon": "./assets/edusign-logo.png",
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
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
      "adaptiveIcon": {
        "foregroundImage": "./assets/edusign-logo.png",
        "backgroundColor": "#161718"
      },
      "package": "com.app.edusign",
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "f09bafa7-3374-4792-8e92-bcfcd3b1963e"
      }
    },
    "owner": "tanujks",
    "newArchEnabled": true
  }
}
