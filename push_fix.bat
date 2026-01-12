@echo off
echo Pushing fixes to GitHub...
git add .
git commit -m "fix(cors): allow production domains and loose origin policy for debugging"
git push origin main
echo Done! Please check Vercel dashboard for deployment status.
pause
