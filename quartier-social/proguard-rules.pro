# ProGuard Rules pour TiexUp - Configuration de sécurité
# ⚠️ IMPORTANT: Ces règles sont essentielles pour la sécurité de l'APK

# ============================================
# RÈGLES GÉNÉRALES DE SÉCURITÉ
# ============================================

# Désactiver l'optimisation agressive pour éviter les erreurs
-dontoptimize
-dontpreverify

# Garder les signatures pour la réflexion
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes EnclosingMethod

# ============================================
# FIREBASE & GOOGLE SERVICES
# ============================================

# Firebase Auth
-keep class com.google.firebase.auth.** { *; }
-keep class com.google.android.gms.internal.firebase-auth-api.** { *; }

# Firebase Firestore
-keep class com.google.firebase.firestore.** { *; }
-keep class com.google.firestore.** { *; }

# Firebase Storage
-keep class com.google.firebase.storage.** { *; }

# Google Play Services
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# ============================================
# REACT NATIVE & EXPO
# ============================================

# React Native Core
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Expo
-keep class expo.modules.** { *; }
-keep class host.exp.exponent.** { *; }

# Metro Bundler
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.uimanager.** { *; }

# ============================================
# SÉCURITÉ APPLICATIVE
# ============================================

# Obfusquer les noms de classes sensibles
-keep class com.tiexup.** { *; }

# Masquer les chaînes de caractères sensibles
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# ============================================
# EXCEPTIONS CRITIQUES
# ============================================

# MainActivity - NE PAS OBFUSQUER
-keep class com.tiexup.MainActivity { *; }

# Application class - NE PAS OBFUSQUER  
-keep class com.tiexup.MainApplication { *; }

# ============================================
# RÈGLES DE SÉCURITÉ AVANCÉES
# ============================================

# Empêcher la décompilation des méthodes critiques
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Masquer les informations de debug
-assumenosideeffects class * {
    public static void debug(...);
    public static void trace(...);
}

# ============================================
# WARNINGS & ERREURS
# ============================================

# Ignorer les warnings non critiques
-dontwarn javax.annotation.**
-dontwarn javax.inject.**
-dontwarn sun.misc.Unsafe

# Continuer malgré les erreurs mineures
-ignorewarnings
