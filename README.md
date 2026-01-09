# Recurring - Monthly Meeting Scheduler

A beautiful web app for scheduling recurring monthly meetings. Find the perfect time slot by collecting everyone's availability for specific day-week combinations (like "1st Monday" or "3rd Thursday").

## Features

- Select recurring monthly availability (day + week combinations)
- Choose specific time slots for each selection
- Real-time updates as participants respond
- Visual heatmap showing group availability
- Shareable invite links
- Detailed breakdown of who's available when

## Complete Deployment Guide for Beginners

### Step 1: Install Required Software (One-time setup)

#### 1.1 Install Git
- **Windows**: Download from https://git-scm.com/download/win
  - Run the installer
  - Use default settings (just keep clicking "Next")
  - Open "Git Bash" when done to verify

- **Mac**: Open Terminal (search "Terminal" in Spotlight)
  - Type: `git --version`
  - If not installed, it will prompt you to install

- **Verify**: Type `git --version` in your terminal/Git Bash

#### 1.2 Install Node.js
- Go to https://nodejs.org/
- Download the "LTS" version (left button)
- Run the installer with default settings
- **Verify**: Open a NEW terminal/Git Bash and type:
  ```
  node --version
  npm --version
  ```
  Both should show version numbers

### Step 2: Set Up GitHub Account

#### 2.1 Create GitHub Account
1. Go to https://github.com
2. Click "Sign up"
3. Follow the prompts to create your account
4. Verify your email address

#### 2.2 Configure Git on Your Computer
Open Git Bash (Windows) or Terminal (Mac) and run these commands (replace with YOUR info):

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3: Create GitHub Repository

1. Log into GitHub
2. Click the "+" icon in top right corner
3. Select "New repository"
4. Fill in:
   - **Repository name**: `recurring-scheduler` (must match exactly!)
   - **Description**: "Monthly meeting scheduler"
   - **Public** (select this radio button)
   - **Do NOT check** "Add a README file"
5. Click "Create repository"
6. **Keep this page open** - you'll need it in Step 5

### Step 4: Prepare Your Project Files

#### 4.1 Download Your Project
1. You should have received a folder called `recurring-scheduler` with all the files
2. Save it somewhere easy to find (like your Desktop or Documents folder)
3. Note the full path to this folder (you'll need it next)

#### 4.2 Open Terminal in Your Project Folder

**Windows:**
1. Open File Explorer
2. Navigate to the `recurring-scheduler` folder
3. Right-click inside the folder (on empty space)
4. Select "Git Bash Here"

**Mac:**
1. Open Terminal
2. Type `cd ` (with a space after cd)
3. Drag the `recurring-scheduler` folder into the Terminal window
4. Press Enter

#### 4.3 Install Dependencies
In your terminal, type:

```bash
npm install
```

This will take 2-3 minutes. It's downloading all the code libraries your app needs.

### Step 5: Upload to GitHub

Run these commands one at a time (press Enter after each):

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "Initial commit"
```

```bash
git branch -M main
```

Now, go back to the GitHub page from Step 3. You'll see instructions with commands. Find the section that says "…or push an existing repository from the command line" and copy the first command. It looks like:

```bash
git remote add origin https://github.com/YOUR-USERNAME/recurring-scheduler.git
```

Paste this into your terminal and press Enter.

Then run:

```bash
git push -u origin main
```

**If prompted for username/password:**
- Username: Your GitHub username
- Password: You need to create a "Personal Access Token" (see instructions below)

#### Creating a Personal Access Token (if needed):
1. Go to GitHub.com → Click your profile picture → Settings
2. Scroll to bottom → Click "Developer settings"
3. Click "Personal access tokens" → "Tokens (classic)"
4. Click "Generate new token" → "Generate new token (classic)"
5. Give it a name like "recurring-scheduler"
6. Check the "repo" checkbox
7. Click "Generate token" at the bottom
8. **Copy the token immediately** (you can't see it again!)
9. Use this token as your password when git asks

### Step 6: Deploy to GitHub Pages

#### 6.1 Update Configuration File
In your project folder, open `vite.config.js` in a text editor (like Notepad or TextEdit).

Find this line:
```javascript
base: '/recurring-scheduler/',
```

If you named your repository something different in Step 3, change `recurring-scheduler` to match YOUR repository name. Save the file.

#### 6.2 Run Deployment Commands

In your terminal, run:

```bash
npm run build
```

This creates an optimized version of your app (takes about 30 seconds).

Then run:

```bash
npx gh-pages -d dist
```

This uploads your app to GitHub Pages.

### Step 7: Enable GitHub Pages

1. Go to your repository on GitHub.com
2. Click "Settings" tab (top right)
3. Scroll down and click "Pages" in the left sidebar
4. Under "Source", you should see "gh-pages" branch selected
5. Your site will be live at: `https://YOUR-USERNAME.github.io/recurring-scheduler/`

**It takes 2-5 minutes for your site to go live the first time.**

### Step 8: Test Your Site

1. Wait 5 minutes after Step 7
2. Visit: `https://YOUR-USERNAME.github.io/recurring-scheduler/`
3. You should see your meeting scheduler!

## Making Updates Later

Whenever you want to update your site:

1. Make changes to files in your project folder
2. Open terminal in the project folder
3. Run these commands:
   ```bash
   git add .
   git commit -m "Description of your changes"
   git push
   npm run deploy
   ```
4. Wait 2-3 minutes and refresh your site

## Troubleshooting

**"npm: command not found"**
- Node.js wasn't installed correctly. Reinstall from nodejs.org and restart your terminal

**"Permission denied" when pushing to GitHub**
- You need a Personal Access Token (see Step 5)

**Site shows 404 error**
- Check that GitHub Pages is enabled (Step 7)
- Wait 5 minutes and try again
- Make sure the `base` in vite.config.js matches your repository name

**Changes aren't showing up**
- Did you run `npm run deploy`?
- Wait 2-3 minutes and do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Clear your browser cache

**App is blank/white screen**
- Check browser console for errors (press F12)
- The `base` path in vite.config.js might be wrong

## Local Development

To test changes on your computer before deploying:

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

## Support

If you get stuck:
1. Read the error message carefully
2. Google the exact error message
3. Check that you followed each step exactly
4. Make sure all software is installed (git --version, node --version, npm --version should all work)

## License

This project is open source and available for personal and commercial use.
