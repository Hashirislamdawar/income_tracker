# Jenkins CI/CD Integration Guide

This guide outlines the steps to integrate your Dockerized Next.js app with Jenkins to automatically build and push to Docker Hub whenever you commit code to GitHub.

## Part 1: Prerequisites
To do this, you will need a running Jenkins server that has:
1. **Docker Installed**: Jenkins needs to run Docker commands (`docker build`, `docker push`).
2. **Git Installed**: Jenkins needs to be able to clone your GitHub repository.
3. The **Pipeline** plugin installed (usually installed by default).

## Part 2: Add Docker Hub Credentials to Jenkins
Jenkins needs your Docker Hub credentials so it can push on your behalf without exposing your password in the code.

1. Open your Jenkins Dashboard.
2. Go to **Manage Jenkins** -> **Credentials**.
3. Under *Stores scoped to Jenkins*, click on `(global)` then `Add Credentials` (top right).
4. Set the following:
   - **Kind**: `Username with password`
   - **Scope**: `Global`
   - **Username**: `hashirislam1012`
   - **Password**: Your Docker Hub Password (or Personal Access Token)
   - **ID**: `docker-hub-credentials` *(Important: This must match the name in the Jenkinsfile)*
   - **Description**: Docker Hub account
5. Click **Create**.

## Part 3: Create the Jenkins Pipeline Job
1. From the Jenkins Dashboard, click **New Item**.
2. Enter a name (e.g., `Income-Tracker-Pipeline`).
3. Select **Pipeline** and click **OK**.
4. Scroll down to the **Pipeline** section:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/Hashirislamdawar/income_tracker.git`
   - **Branch Specifier**: `*/main`
   - **Script Path**: `Jenkinsfile`
5. Click **Save**.

## Part 4: Setup GitHub Webhooks (Automatic Builds)
To make Jenkins build automatically when you `git push` to GitHub:

1. In your **Jenkins Pipeline config** (from Part 3), check the box for **GitHub hook trigger for GITScm polling**. Click Save.
2. Go to your **GitHub Repository** -> **Settings** -> **Webhooks**.
3. Click **Add webhook**.
4. Set the **Payload URL** to your Jenkins server URL followed by `/github-webhook/`.
   - *Example: `http://<your-jenkins-ip>:8080/github-webhook/`*
5. Set **Content type** to `application/json`.
6. Leave everything else as default and click **Add webhook**.

> **Note:** For this to work, your Jenkins server must be accessible from the public internet (GitHub). If it's running on your local laptop, GitHub won't be able to reach it. You would either need to host Jenkins on a cloud server (AWS, DigitalOcean) or use a reverse proxy like `ngrok` for testing.
