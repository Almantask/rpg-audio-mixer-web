param(
    [string]$FeaturePath = "campaign_crud.feature"
)

$env:JAVA_HOME="C:\Program Files\Android\Android Studio1\jbr"

if ([string]::IsNullOrWhiteSpace($FeaturePath)) {
    .\gradlew connectedAndroidTest
} else {
    .\gradlew connectedAndroidTest -PcucumberFeatures="$FeaturePath"
}
