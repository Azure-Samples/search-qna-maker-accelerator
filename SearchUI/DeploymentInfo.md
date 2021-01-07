# Deployment Info

This web app is currently deployed from the ARM template using MSDeploy. A zip folder is needed for this deployment method.

To create the zip folder:

1. Navigate to the `SearchUI` folder

    ```
    cd SearchUI
    ```

2. Install the required packages

    ```
    npm install
    ```

3. Build the web app

    ```
    npm run-script build
    ```

4. Next, create a zip file from the contents of the `build` folder. It's important that the contents of the folder are at the top level of the zip file. To do this in File Explorer, navigate to the build folder, select every item, then right-click and send the contents to a zip file.