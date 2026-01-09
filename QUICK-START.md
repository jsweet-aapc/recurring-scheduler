# Quick Start Checklist for GitHub Pages Deployment

Print this out or keep it open while you work!

## ☐ BEFORE YOU START (One-time setup)

### Install Software:
- ☐ Install Git from https://git-scm.com
- ☐ Install Node.js from https://nodejs.org (get the LTS version)
- ☐ Verify both work:
  - Open terminal/Git Bash
  - Type: `git --version` (should show a version)
  - Type: `node --version` (should show a version)
  - Type: `npm --version` (should show a version)

### Set Up Git:
- ☐ Run: `git config --global user.name "Your Name"`
- ☐ Run: `git config --global user.email "your.email@example.com"`

## ☐ STEP 1: GitHub Account & Repository

- ☐ Create GitHub account at https://github.com
- ☐ Click "+" → "New repository"
- ☐ Name it: `recurring-scheduler`
- ☐ Select "Public"
- ☐ Don't check "Add a README"
- ☐ Click "Create repository"
- ☐ **Keep this page open!**

## ☐ STEP 2: Prepare Your Files

- ☐ Download the `recurring-scheduler` folder
- ☐ Save it somewhere easy to find (Desktop is good)
- ☐ Open terminal IN that folder:
  - **Windows**: Right-click in folder → "Git Bash Here"
  - **Mac**: Terminal → type `cd ` → drag folder in → press Enter

## ☐ STEP 3: Install Dependencies

In the terminal, type:
```
npm install
```
- ☐ Wait 2-3 minutes for it to finish
- ☐ You should see "added [number] packages"

## ☐ STEP 4: Upload to GitHub

Type these commands ONE AT A TIME (press Enter after each):

```
git init
```
☐ Done

```
git add .
```
☐ Done

```
git commit -m "Initial commit"
```
☐ Done

```
git branch -M main
```
☐ Done

Now go to your GitHub page from Step 1, find the command that starts with:
`git remote add origin https://github.com/YOUR-USERNAME/recurring-scheduler.git`

- ☐ Copy that entire command
- ☐ Paste it in your terminal and press Enter

Then type:
```
git push -u origin main
```
☐ Done

**If it asks for password:**
- ☐ You need a Personal Access Token
- ☐ GitHub.com → Your profile picture → Settings
- ☐ Scroll down → "Developer settings"
- ☐ "Personal access tokens" → "Tokens (classic)"
- ☐ "Generate new token (classic)"
- ☐ Name it "recurring-scheduler"
- ☐ Check "repo" box
- ☐ Click "Generate token"
- ☐ **COPY THE TOKEN IMMEDIATELY**
- ☐ Use this token as your password

## ☐ STEP 5: Deploy to GitHub Pages

In terminal, type:
```
npm run build
```
☐ Done (takes 30 seconds)

```
npx gh-pages -d dist
```
☐ Done (takes 30 seconds)

## ☐ STEP 6: Enable GitHub Pages

- ☐ Go to your repository on GitHub.com
- ☐ Click "Settings" tab
- ☐ Click "Pages" in left sidebar
- ☐ Source should show "gh-pages" branch
- ☐ Note your URL: `https://YOUR-USERNAME.github.io/recurring-scheduler/`

## ☐ STEP 7: Wait & Test

- ☐ Wait 5 minutes (set a timer!)
- ☐ Visit: `https://YOUR-USERNAME.github.io/recurring-scheduler/`
- ☐ Your app should be live! 🎉

## 🔧 Making Changes Later

Whenever you update your app:

1. ☐ Edit files in your project folder
2. ☐ Open terminal in that folder
3. ☐ Run:
   ```
   git add .
   git commit -m "Describe your changes"
   git push
   npm run deploy
   ```
4. ☐ Wait 2-3 minutes
5. ☐ Refresh your site

## ❌ Common Problems

**"npm: command not found"**
→ Reinstall Node.js, restart terminal

**"Permission denied" on GitHub**
→ You need a Personal Access Token (see Step 4)

**Site shows 404**
→ Wait 5 more minutes, check GitHub Pages is enabled

**Blank white page**
→ Check vite.config.js has correct repository name

**Need help?**
→ Check the full README.md file for detailed troubleshooting

---

Your URL will be: `https://YOUR-USERNAME.github.io/recurring-scheduler/`

(Replace YOUR-USERNAME with your actual GitHub username)
