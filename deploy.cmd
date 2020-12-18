@echo off

IF "%SITE_FLAVOR%" == "react" (
  deploy.react.cmd
) ELSE (
  IF "%SITE_FLAVOR%" == "nodefunctions" (
    deploy.nodefunctions.cmd
  ) ELSE (
    IF "%SITE_FLAVOR%" == "dotnetfunctions" (
    deploy.dotnetfunctions.cmd
    ) ELSE (
      echo You have to set SITE_FLAVOR setting to either "react" or "nodefunctions" or "dotnetfunctions"
      exit /b 1
    )
  )
)